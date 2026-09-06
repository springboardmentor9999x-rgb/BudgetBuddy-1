export type NotificationCategory =
  | 'budget'
  | 'expenses'
  | 'income'
  | 'savings'
  | 'account'
  | 'security'
  | 'summary'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type NotificationType =
  | 'BUDGET_WARNING'
  | 'BUDGET_EXCEEDED'
  | 'EXPENSE_ADDED'
  | 'LARGE_EXPENSE'
  | 'SPENDING_INCREASE'
  | 'INCOME_ADDED'
  | 'INCOME_REMINDER'
  | 'GOAL_CREATED'
  | 'GOAL_PROGRESS'
  | 'GOAL_COMPLETED'
  | 'GOAL_DEADLINE'
  | 'SAVINGS_UPDATED'
  | 'BILL_REMINDER'
  | 'RECURRING_PAYMENT'
  | 'ACCOUNT_ADDED'
  | 'SECURITY_LOGIN'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_CHANGED'
  | 'MONTHLY_SUMMARY'
  | 'WEEKLY_SUMMARY'
  | 'SYSTEM';

export interface NotificationMetadata {
  budgetId?: string;
  expenseId?: string;
  incomeId?: string;
  goalId?: string;
  accountId?: string;
  billId?: string;
  threshold?: number;
  percentage?: number;
  amount?: number;
  spent?: number;
  limit?: number;
  month?: number;
  year?: number;
  monthYear?: string;
  category?: string;
  accountName?: string;
  prevSpending?: number;
  currentSpending?: number;
  ipAddress?: string;
  device?: string;
  [key: string]: any;
}

export interface NotificationDoc {
  _id?: string;
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  metadata?: NotificationMetadata;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPreferenceDoc {
  userId: string;
  // In-App Notification Toggles
  budgetAlerts: boolean;
  expenseAlerts: boolean;
  incomeAlerts: boolean;
  goalAlerts: boolean;
  billReminders: boolean;
  accountAlerts: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;

  // Email Notification Toggles
  emailBudgetAlerts: boolean;
  emailGoalAlerts: boolean;
  emailBillReminders: boolean;
  emailWeeklySummary: boolean;
  emailMonthlySummary: boolean;

  // Configurations & Customization
  largeExpenseThreshold: number;
  soundEnabled: boolean;
}

export interface BillReminderItem {
  id: string;
  userId: string;
  billName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  accountId?: string;
  accountName?: string;
  recurring: 'Monthly' | 'Quarterly' | 'Yearly' | 'One-Time';
  reminderDays: number; // e.g. 1, 2, 3, 7 days before
  isPaid?: boolean;
  createdAt: string;
}
