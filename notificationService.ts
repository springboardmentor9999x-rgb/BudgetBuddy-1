import { NotificationModel } from '../models/Notification';
import { NotificationPreferenceModel } from '../models/NotificationPreference';
import { sendNotificationEmail } from './emailService';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setSocketIOInstance = (io: SocketIOServer) => {
  ioInstance = io;
};

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  category: 'budget' | 'expenses' | 'income' | 'savings' | 'account' | 'security' | 'summary' | 'system';
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresInDays?: number;
}

export const createNotification = async (input: CreateNotificationInput): Promise<any | null> => {
  try {
    const { userId, type, title, message, category, priority = 'medium', actionUrl, metadata = {}, expiresInDays } = input;

    let prefs: any = await (NotificationPreferenceModel as any).findOne({ userId });
    if (!prefs) {
      prefs = await (NotificationPreferenceModel as any).create({ userId });
    }

    if (category === 'budget' && !prefs.budgetAlerts) return null;
    if (category === 'expenses' && !prefs.expenseAlerts) return null;
    if (category === 'income' && !prefs.incomeAlerts) return null;
    if (category === 'savings' && !prefs.goalAlerts) return null;
    if (category === 'account' && !prefs.accountAlerts) return null;
    if (type === 'BILL_REMINDER' && !prefs.billReminders) return null;
    if (type === 'WEEKLY_SUMMARY' && !prefs.weeklySummary) return null;
    if (type === 'MONTHLY_SUMMARY' && !prefs.monthlySummary) return null;

    if (type === 'BUDGET_WARNING' || type === 'BUDGET_EXCEEDED') {
      const { budgetId, threshold, monthYear } = metadata;
      if (budgetId && threshold && monthYear) {
        const existing = await (NotificationModel as any).findOne({
          userId,
          type,
          'metadata.budgetId': budgetId,
          'metadata.threshold': threshold,
          'metadata.monthYear': monthYear,
        });
        if (existing) return null;
      }
    }

    if (type === 'GOAL_PROGRESS') {
      const { goalId, percentage } = metadata;
      if (goalId && percentage) {
        const existing = await (NotificationModel as any).findOne({
          userId,
          type: 'GOAL_PROGRESS',
          'metadata.goalId': goalId,
          'metadata.percentage': percentage,
        });
        if (existing) return null;
      }
    }

    let expiresAt: Date | undefined = undefined;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    } else if (category !== 'security') {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }

    const notification: any = await (NotificationModel as any).create({
      userId,
      type,
      title,
      message,
      category,
      priority,
      isRead: false,
      actionUrl,
      metadata,
      expiresAt,
    });

    if (ioInstance) {
      ioInstance.to(`user:${userId}`).emit('notification:new', notification.toJSON());
    }

    let shouldSendEmail = false;
    if (category === 'budget' && prefs.emailBudgetAlerts) shouldSendEmail = true;
    if (category === 'savings' && prefs.emailGoalAlerts) shouldSendEmail = true;
    if (type === 'BILL_REMINDER' && prefs.emailBillReminders) shouldSendEmail = true;
    if (type === 'MONTHLY_SUMMARY' && prefs.emailMonthlySummary) shouldSendEmail = true;
    if (type === 'WEEKLY_SUMMARY' && prefs.emailWeeklySummary) shouldSendEmail = true;
    if (category === 'security') shouldSendEmail = true;

    if (shouldSendEmail) {
      sendNotificationEmail({
        to: metadata.userEmail || 'user@budgetbuddy.app',
        subject: `[BudgetBuddy] ${title}`,
        title,
        message,
        actionUrl,
        actionText: 'View in BudgetBuddy',
      }).catch((err) => console.error('[NotificationService] Email error:', err));
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    return null;
  }
};

export const sendBudgetNotification = async (params: {
  userId: string;
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  budgetId: string;
  monthYear: string;
}) => {
  const { userId, category, spent, limit, percentage, budgetId, monthYear } = params;

  let type = 'BUDGET_WARNING';
  let title = 'Budget Update';
  let message = `You have used ${percentage}% of your ${category} budget. ₹${spent.toLocaleString('en-IN')} of ₹${limit.toLocaleString('en-IN')} has been spent.`;
  let priority: 'low' | 'medium' | 'high' = 'medium';

  if (percentage >= 100 || spent > limit) {
    type = 'BUDGET_EXCEEDED';
    title = '🚨 Budget Exceeded';
    const exceededAmount = spent - limit;
    message = `You have reached your ${category} budget limit.\nBudget: ₹${limit.toLocaleString('en-IN')}\nSpent: ₹${spent.toLocaleString('en-IN')}\nExceeded by: ₹${exceededAmount.toLocaleString('en-IN')}`;
    priority = 'high';
  } else if (percentage >= 90) {
    title = '⚠️ Budget Warning';
    message = `Your ${category} budget is almost exhausted. 90% of your monthly budget has been used.`;
    priority = 'high';
  } else if (percentage >= 80) {
    title = '⚠️ Budget Alert';
    message = `Your ${category} budget is 80% used. ₹${spent.toLocaleString('en-IN')} of ₹${limit.toLocaleString('en-IN')} has been spent.`;
    priority = 'medium';
  } else if (percentage >= 50) {
    title = 'Budget Update';
    message = `You have used 50% of your ${category} budget. ₹${spent.toLocaleString('en-IN')} of ₹${limit.toLocaleString('en-IN')} has been spent.`;
    priority = 'low';
  }

  return createNotification({
    userId,
    type,
    title,
    message,
    category: 'budget',
    priority,
    actionUrl: '/budgets',
    metadata: { budgetId, threshold: percentage, spent, limit, category, monthYear },
  });
};

export const sendExpenseNotification = async (params: {
  userId: string;
  amount: number;
  category: string;
  accountName?: string;
  date: string;
  prevMonthAmount?: number;
  currentMonthAmount?: number;
  pctIncrease?: number;
}) => {
  const { userId, amount, category, accountName, date, prevMonthAmount, currentMonthAmount, pctIncrease } = params;

  const prefs: any = await (NotificationPreferenceModel as any).findOne({ userId });
  const threshold = prefs?.largeExpenseThreshold || 10000;

  if (amount >= threshold) {
    await createNotification({
      userId,
      type: 'LARGE_EXPENSE',
      title: '💸 Large Expense',
      message: `A large expense of ₹${amount.toLocaleString('en-IN')} was recorded. Category: ${category}, Account: ${accountName || 'Primary'}, Date: ${date}`,
      category: 'expenses',
      priority: 'medium',
      actionUrl: '/expenses',
      metadata: { amount, category, accountName, date },
    });
  }

  if (pctIncrease && pctIncrease >= 25 && prevMonthAmount && currentMonthAmount) {
    await createNotification({
      userId,
      type: 'SPENDING_INCREASE',
      title: '📈 Spending Increase',
      message: `Your ${category} spending is ${Math.round(pctIncrease)}% higher than last month. Last month: ₹${prevMonthAmount.toLocaleString('en-IN')}, This month: ₹${currentMonthAmount.toLocaleString('en-IN')}`,
      category: 'expenses',
      priority: 'medium',
      actionUrl: '/expenses',
      metadata: { category, prevMonthAmount, currentMonthAmount, pctIncrease },
    });
  }
};

export const sendIncomeNotification = async (params: {
  userId: string;
  amount: number;
  source: string;
  accountName?: string;
  isReminder?: boolean;
}) => {
  const { userId, amount, source, accountName, isReminder } = params;

  if (isReminder) {
    return createNotification({
      userId,
      type: 'INCOME_REMINDER',
      title: '💰 Income Reminder',
      message: `Your monthly ${source} is expected soon. Expected amount: ₹${amount.toLocaleString('en-IN')}`,
      category: 'income',
      priority: 'low',
      actionUrl: '/income',
      metadata: { amount, source },
    });
  }

  return createNotification({
    userId,
    type: 'INCOME_ADDED',
    title: '💰 Income Added',
    message: `₹${amount.toLocaleString('en-IN')} ${source} was added successfully. Income Type: ${source}, Account: ${accountName || 'Primary'}`,
    category: 'income',
    priority: 'low',
    actionUrl: '/income',
    metadata: { amount, source, accountName },
  });
};

export const sendGoalNotification = async (params: {
  userId: string;
  goalId: string;
  goalTitle: string;
  targetAmount: number;
  currentAmount: number;
  actionType: 'created' | 'deposit' | 'progress_check' | 'deadline';
  targetDate?: string;
  depositAmount?: number;
  previousAmount?: number;
  daysRemaining?: number;
}) => {
  const {
    userId,
    goalId,
    goalTitle,
    targetAmount,
    currentAmount,
    actionType,
    targetDate,
    depositAmount,
    previousAmount,
    daysRemaining,
  } = params;

  const percentage = Math.round((currentAmount / targetAmount) * 100);

  if (actionType === 'created') {
    return createNotification({
      userId,
      type: 'GOAL_CREATED',
      title: '🎯 Savings Goal Created',
      message: `Your "${goalTitle}" savings goal has been created. Target: ₹${targetAmount.toLocaleString('en-IN')}, Target Date: ${targetDate || 'Flexible'}`,
      category: 'savings',
      priority: 'low',
      actionUrl: '/savings-goals',
      metadata: { goalId, targetAmount, targetDate },
    });
  }

  if (actionType === 'deposit' && depositAmount !== undefined) {
    return createNotification({
      userId,
      type: 'SAVINGS_UPDATED',
      title: '💰 Savings Updated',
      message: `₹${depositAmount.toLocaleString('en-IN')} has been added to your ${goalTitle} goal. Previous savings: ₹${(previousAmount || 0).toLocaleString('en-IN')}, New savings: ₹${currentAmount.toLocaleString('en-IN')}, Progress: ${percentage}%`,
      category: 'savings',
      priority: 'low',
      actionUrl: '/savings-goals',
      metadata: { goalId, depositAmount, previousAmount, currentAmount, percentage },
    });
  }

  if (actionType === 'deadline' && daysRemaining !== undefined) {
    const remainingAmount = targetAmount - currentAmount;
    if (daysRemaining === 30) {
      return createNotification({
        userId,
        type: 'GOAL_DEADLINE',
        title: '📅 Goal Reminder',
        message: `Your ${goalTitle} goal has 30 days remaining. Remaining amount: ₹${remainingAmount.toLocaleString('en-IN')}`,
        category: 'savings',
        priority: 'medium',
        actionUrl: '/savings-goals',
        metadata: { goalId, daysRemaining, remainingAmount },
      });
    } else if (daysRemaining === 7) {
      return createNotification({
        userId,
        type: 'GOAL_DEADLINE',
        title: '⚠️ Goal Deadline',
        message: `Your ${goalTitle} savings goal is due in 7 days. You still need ₹${remainingAmount.toLocaleString('en-IN')}.`,
        category: 'savings',
        priority: 'high',
        actionUrl: '/savings-goals',
        metadata: { goalId, daysRemaining, remainingAmount },
      });
    } else if (daysRemaining <= 0) {
      return createNotification({
        userId,
        type: 'GOAL_DEADLINE',
        title: '📅 Savings Goal Deadline',
        message: `Your ${goalTitle} goal has reached its target date. Saved: ₹${currentAmount.toLocaleString('en-IN')}, Target: ₹${targetAmount.toLocaleString('en-IN')}, Remaining: ₹${Math.max(0, remainingAmount).toLocaleString('en-IN')}`,
        category: 'savings',
        priority: 'medium',
        actionUrl: '/savings-goals',
        metadata: { goalId, currentAmount, targetAmount },
      });
    }
  }

  if (currentAmount >= targetAmount) {
    return createNotification({
      userId,
      type: 'GOAL_COMPLETED',
      title: '🎉 Savings Goal Completed!',
      message: `Congratulations! You have successfully reached your ${goalTitle} savings goal. Target: ₹${targetAmount.toLocaleString('en-IN')}, Saved: ₹${currentAmount.toLocaleString('en-IN')}`,
      category: 'savings',
      priority: 'high',
      actionUrl: '/savings-goals',
      metadata: { goalId, targetAmount, currentAmount, percentage: 100 },
    });
  } else if (percentage >= 75) {
    return createNotification({
      userId,
      type: 'GOAL_PROGRESS',
      title: '🎯 Almost There!',
      message: `You have reached 75% of your ${goalTitle} savings goal. Saved: ₹${currentAmount.toLocaleString('en-IN')} of ₹${targetAmount.toLocaleString('en-IN')}`,
      category: 'savings',
      priority: 'low',
      actionUrl: '/savings-goals',
      metadata: { goalId, percentage: 75 },
    });
  } else if (percentage >= 50) {
    return createNotification({
      userId,
      type: 'GOAL_PROGRESS',
      title: '🎯 Halfway There!',
      message: `You have saved 50% of your ${goalTitle} goal. Keep going! Saved: ₹${currentAmount.toLocaleString('en-IN')} of ₹${targetAmount.toLocaleString('en-IN')}`,
      category: 'savings',
      priority: 'low',
      actionUrl: '/savings-goals',
      metadata: { goalId, percentage: 50 },
    });
  } else if (percentage >= 25) {
    return createNotification({
      userId,
      type: 'GOAL_PROGRESS',
      title: '🎯 Goal Progress',
      message: `You have reached 25% of your ${goalTitle} savings goal. Saved: ₹${currentAmount.toLocaleString('en-IN')} of ₹${targetAmount.toLocaleString('en-IN')}`,
      category: 'savings',
      priority: 'low',
      actionUrl: '/savings-goals',
      metadata: { goalId, percentage: 25 },
    });
  }
};

export const sendBillReminder = async (params: {
  userId: string;
  billName: string;
  amount: number;
  daysUntilDue: number;
  dueDate: string;
}) => {
  const { userId, billName, amount, daysUntilDue } = params;
  return createNotification({
    userId,
    type: 'BILL_REMINDER',
    title: '⚡ Bill Reminder',
    message: `Your ${billName} of ₹${amount.toLocaleString('en-IN')} is due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}.`,
    category: 'system',
    priority: 'medium',
    actionUrl: '/settings',
    metadata: { billName, amount, daysUntilDue },
  });
};

export const sendSecurityNotification = async (params: {
  userId: string;
  type: 'SECURITY_LOGIN' | 'PASSWORD_CHANGED' | 'EMAIL_CHANGED';
  timeStr: string;
  newEmail?: string;
}) => {
  const { userId, type, timeStr, newEmail } = params;

  let title = '🔐 New Login';
  let message = `Your BudgetBuddy account was accessed at ${timeStr}.`;

  if (type === 'PASSWORD_CHANGED') {
    title = '🔐 Password Changed';
    message = 'Your BudgetBuddy password was successfully changed. If you did not make this change, secure your account immediately.';
  } else if (type === 'EMAIL_CHANGED') {
    title = '🔐 Email Address Updated';
    message = `Your account email address has been changed successfully ${newEmail ? `to ${newEmail}` : ''}.`;
  }

  return createNotification({
    userId,
    type,
    title,
    message,
    category: 'security',
    priority: 'high',
    actionUrl: '/profile',
    metadata: { timeStr, newEmail },
  });
};

export const sendMonthlySummaryNotification = async (params: {
  userId: string;
  monthNameYear: string;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  topExpenseCategory: string;
  budgetUsagePct: number;
}) => {
  const {
    userId,
    monthNameYear,
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    topExpenseCategory,
    budgetUsagePct,
  } = params;

  const message = `Monthly Financial Summary for ${monthNameYear}:\nIncome: ₹${totalIncome.toLocaleString('en-IN')}\nExpenses: ₹${totalExpenses.toLocaleString('en-IN')}\nSavings: ₹${totalSavings.toLocaleString('en-IN')}\nSavings Rate: ${savingsRate}%\nTop Category: ${topExpenseCategory}\nBudget Usage: ${budgetUsagePct}%`;

  return createNotification({
    userId,
    type: 'MONTHLY_SUMMARY',
    title: '📊 Monthly Financial Summary',
    message,
    category: 'summary',
    priority: 'medium',
    actionUrl: '/monthly-summary',
    metadata: {
      monthNameYear,
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      topExpenseCategory,
      budgetUsagePct,
    },
  });
};
