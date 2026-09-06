import { IncomeModel } from '../models/Income';
import { ExpenseModel } from '../models/Expense';
import { BudgetModel } from '../models/Budget';
import { SavingsGoalModel } from '../models/SavingsGoal';
import { BillModel } from '../models/Bill';
import { NotificationModel } from '../models/Notification';

export interface DashboardQueryParams {
  period?: 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  monthYear?: string;
}

export const getDashboardData = async (userId: string, params: DashboardQueryParams = {}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStr = String(currentMonth).padStart(2, '0');
  const defaultMonthYear = params.monthYear || `${currentYear}-${currentMonthStr}`;

  // 1. Calculate Date Range Bounds
  let startDate = '';
  let endDate = '';

  const period = params.period || 'this_month';

  if (params.startDate && params.endDate) {
    startDate = params.startDate;
    endDate = params.endDate;
  } else if (period === 'today') {
    const todayStr = `${currentYear}-${currentMonthStr}-${String(now.getDate()).padStart(2, '0')}`;
    startDate = todayStr;
    endDate = todayStr;
  } else if (period === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(now.setDate(diff + 6));
    startDate = monday.toISOString().split('T')[0];
    endDate = sunday.toISOString().split('T')[0];
  } else if (period === 'this_month') {
    startDate = `${defaultMonthYear}-01`;
    endDate = `${defaultMonthYear}-31`;
  } else if (period === 'last_month') {
    const prevD = new Date(currentYear, currentMonth - 2, 1);
    const pYr = prevD.getFullYear();
    const pMo = String(prevD.getMonth() + 1).padStart(2, '0');
    startDate = `${pYr}-${pMo}-01`;
    endDate = `${pYr}-${pMo}-31`;
  } else if (period === 'last_3_months') {
    const prev3D = new Date(currentYear, currentMonth - 3, 1);
    const pYr = prev3D.getFullYear();
    const pMo = String(prev3D.getMonth() + 1).padStart(2, '0');
    startDate = `${pYr}-${pMo}-01`;
    endDate = `${defaultMonthYear}-31`;
  } else if (period === 'last_6_months') {
    const prev6D = new Date(currentYear, currentMonth - 6, 1);
    const pYr = prev6D.getFullYear();
    const pMo = String(prev6D.getMonth() + 1).padStart(2, '0');
    startDate = `${pYr}-${pMo}-01`;
    endDate = `${defaultMonthYear}-31`;
  } else if (period === 'this_year') {
    startDate = `${currentYear}-01-01`;
    endDate = `${currentYear}-12-31`;
  } else {
    startDate = `${defaultMonthYear}-01`;
    endDate = `${defaultMonthYear}-31`;
  }

  // 2. Fetch User Financial Records
  const [allIncomes, allExpenses, allBudgets, allGoals, allBills, allNotifications] = await Promise.all([
    (IncomeModel as any).find({ userId }).sort({ date: -1 }).lean(),
    (ExpenseModel as any).find({ userId }).sort({ date: -1 }).lean(),
    (BudgetModel as any).find({ userId }).lean(),
    (SavingsGoalModel as any).find({ userId }).sort({ priority: 1, createdAt: -1 }).lean(),
    (BillModel as any).find({ userId }).sort({ dueDate: 1 }).lean(),
    (NotificationModel as any).find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  // Filter current period records
  const periodIncomes = allIncomes.filter((item: any) => item.date >= startDate && item.date <= endDate);
  const periodExpenses = allExpenses.filter((item: any) => item.date >= startDate && item.date <= endDate);

  // Calculate previous period for trends comparison
  const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const prevMonthYearStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthIncomes = allIncomes.filter((item: any) => item.date.startsWith(prevMonthYearStr));
  const prevMonthExpenses = allExpenses.filter((item: any) => item.date.startsWith(prevMonthYearStr));

  const prevTotalIncome = prevMonthIncomes.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const prevTotalExpenses = prevMonthExpenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);

  // 3. Main Financial Summary Calculations
  const totalIncome = periodIncomes.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = periodExpenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;
  const monthlySavings = Math.max(0, balance);
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;

  // % Changes from previous period
  const incomePctChange = prevTotalIncome > 0
    ? Math.round(((totalIncome - prevTotalIncome) / prevTotalIncome) * 100)
    : 0;
  const expensePctChange = prevTotalExpenses > 0
    ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100)
    : 0;

  // Monthly Budget calculations
  const currentBudgets = allBudgets.filter((b: any) => b.monthYear === defaultMonthYear || !b.monthYear);
  const budgetTotalLimit = currentBudgets.reduce(
    (sum: number, b: any) => sum + (Number(b.budgetAmount || b.monthlyLimit) || 0),
    0
  );
  const budgetSpent = totalExpenses;
  const budgetRemaining = Math.max(0, budgetTotalLimit - budgetSpent);
  const budgetPercentage = budgetTotalLimit > 0
    ? Math.min(150, Math.round((budgetSpent / budgetTotalLimit) * 100))
    : 0;

  let budgetHealthStatus: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Budget Exceeded' = 'Healthy';
  if (budgetPercentage > 100) {
    budgetHealthStatus = 'Budget Exceeded';
  } else if (budgetPercentage >= 90) {
    budgetHealthStatus = 'Almost Exceeded';
  } else if (budgetPercentage >= 70) {
    budgetHealthStatus = 'Warning';
  }

  // 4. Prominent Savings Goal
  const primaryGoal = allGoals[0] || {
    title: 'Emergency Fund',
    goalName: 'Emergency Fund',
    targetAmount: 100000,
    currentAmount: 63000,
    savedAmount: 63000,
    targetDate: '2026-12-31',
    category: 'Emergency',
    priority: 'High',
    status: 'in_progress',
  };

  const goalSaved = Number(primaryGoal.currentAmount || primaryGoal.savedAmount || 0);
  const goalTarget = Number(primaryGoal.targetAmount || 1);
  const goalRemaining = Math.max(0, goalTarget - goalSaved);
  const goalProgress = Math.min(100, Math.round((goalSaved / goalTarget) * 100));

  // 5. Build Charts Data
  // Months list for trend charts (last 6 months)
  const last6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    last6Months.push(ym);
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const incomeVsExpenseChart: any[] = [];
  const balanceTrendChart: any[] = [];
  const cashFlowChart: any[] = [];
  const savingsGrowthChart: any[] = [];

  let cumulativeSavings = 0;

  for (const mStr of last6Months) {
    const [y, m] = mStr.split('-').map(Number);
    const mLabel = `${monthNames[m - 1]}`;

    const mIncs = allIncomes.filter((item: any) => item.date.startsWith(mStr));
    const mExps = allExpenses.filter((item: any) => item.date.startsWith(mStr));

    const mIncSum = mIncs.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
    const mExpSum = mExps.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
    const mBal = mIncSum - mExpSum;
    const mSavings = Math.max(0, mBal);
    cumulativeSavings += mSavings;

    incomeVsExpenseChart.push({
      month: mLabel,
      monthKey: mStr,
      income: mIncSum,
      expenses: mExpSum,
      expense: mExpSum,
    });

    balanceTrendChart.push({
      month: mLabel,
      monthKey: mStr,
      balance: mBal,
    });

    cashFlowChart.push({
      month: mLabel,
      monthKey: mStr,
      income: mIncSum,
      expenses: mExpSum,
      expense: mExpSum,
      balance: mBal,
      netSavings: mSavings,
    });

    savingsGrowthChart.push({
      month: mLabel,
      monthKey: mStr,
      savings: mSavings,
      cumulative: cumulativeSavings,
      growth: cumulativeSavings,
    });
  }

  // Expense Categories Breakdown
  const categoryMap = new Map<string, number>();
  periodExpenses.forEach((exp: any) => {
    const cat = exp.category || 'Other';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + (Number(exp.amount) || 0));
  });

  const expenseCategoriesChart = Array.from(categoryMap.entries()).map(([name, amount]) => ({
    name,
    amount,
    value: amount,
    percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Income Sources Breakdown
  const sourceMap = new Map<string, number>();
  periodIncomes.forEach((inc: any) => {
    const src = inc.source || inc.incomeType || 'Other';
    sourceMap.set(src, (sourceMap.get(src) || 0) + (Number(inc.amount) || 0));
  });

  const incomeSourcesChart = Array.from(sourceMap.entries()).map(([name, amount]) => ({
    name,
    amount,
    value: amount,
    percentage: totalIncome > 0 ? Number(((amount / totalIncome) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Weekly Spending (Monday to Sunday)
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdayExpenses: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  periodExpenses.forEach((exp: any) => {
    const expD = new Date(exp.date);
    const dayIdx = expD.getDay(); // 0 is Sunday, 1 is Monday
    const key = dayIdx === 0 ? 'Sunday' : dayNames[dayIdx - 1];
    weekdayExpenses[key] = (weekdayExpenses[key] || 0) + (Number(exp.amount) || 0);
  });

  const weeklySpendingChart = dayNames.map((day, idx) => ({
    day,
    shortDay: dayShort[idx],
    amount: weekdayExpenses[day] || 0,
  }));

  // 6. Financial Analytics Calculations
  const dateDiffDays = Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  );
  const averageDailySpending = Math.round(totalExpenses / dateDiffDays);
  const averageMonthlyIncome = totalIncome;

  let highestExpense: any = null;
  if (periodExpenses.length > 0) {
    const sorted = [...periodExpenses].sort((a: any, b: any) => Number(b.amount) - Number(a.amount));
    highestExpense = {
      description: sorted[0].description,
      category: sorted[0].category,
      amount: Number(sorted[0].amount),
    };
  }

  let highestIncome: any = null;
  if (periodIncomes.length > 0) {
    const sorted = [...periodIncomes].sort((a: any, b: any) => Number(b.amount) - Number(a.amount));
    highestIncome = {
      description: sorted[0].description,
      source: sorted[0].source || sorted[0].incomeType,
      amount: Number(sorted[0].amount),
    };
  }

  const topExpenseCategory = expenseCategoriesChart[0]
    ? { category: expenseCategoriesChart[0].name, amount: expenseCategoriesChart[0].amount }
    : null;

  const topIncomeSource = incomeSourcesChart[0]
    ? { source: incomeSourcesChart[0].name, amount: incomeSourcesChart[0].amount }
    : null;

  // 7. Dynamic Rule-Based Financial Insights
  const dynamicInsights: { id: string; icon: string; text: string; type: 'info' | 'warning' | 'success' }[] = [];

  if (topExpenseCategory) {
    dynamicInsights.push({
      id: 'ins_top_cat',
      icon: '💳',
      text: `Your highest spending category is ${topExpenseCategory.category} (${Number(((topExpenseCategory.amount / (totalExpenses || 1)) * 100).toFixed(0))}%)`,
      type: 'info',
    });
  }

  if (budgetPercentage >= 90) {
    dynamicInsights.push({
      id: 'ins_budget_crit',
      icon: '⚠️',
      text: `You have used ${budgetPercentage}% of your total monthly budget.`,
      type: 'warning',
    });
  } else if (budgetPercentage >= 70) {
    dynamicInsights.push({
      id: 'ins_budget_warn',
      icon: '⚠️',
      text: `You have used ${budgetPercentage}% of your monthly budget. Watch upcoming discretionary expenses.`,
      type: 'warning',
    });
  }

  if (savingsRate >= 30) {
    dynamicInsights.push({
      id: 'ins_savings_high',
      icon: '💰',
      text: `Outstanding savings rate of ${savingsRate}% achieved this period!`,
      type: 'success',
    });
  } else if (savingsRate > 0) {
    dynamicInsights.push({
      id: 'ins_savings_norm',
      icon: '💰',
      text: `Current savings rate is ${savingsRate}%. Target is 30%.`,
      type: 'info',
    });
  }

  if (primaryGoal && goalProgress > 0) {
    dynamicInsights.push({
      id: 'ins_goal',
      icon: '🎯',
      text: `You are ${goalProgress}% towards your "${primaryGoal.title || primaryGoal.goalName}" goal.`,
      type: 'success',
    });
  }

  if (incomePctChange > 0) {
    dynamicInsights.push({
      id: 'ins_inc_up',
      icon: '📈',
      text: `Your total income increased by ${incomePctChange}% compared with previous period.`,
      type: 'success',
    });
  } else if (incomePctChange < 0) {
    dynamicInsights.push({
      id: 'ins_inc_down',
      icon: '📉',
      text: `Income is down ${Math.abs(incomePctChange)}% compared with previous period.`,
      type: 'warning',
    });
  }

  // 8. Recent Unified Transactions
  const unifiedTransactions = [
    ...periodIncomes.map((inc: any) => ({
      id: inc._id ? inc._id.toString() : inc.id,
      date: inc.date,
      type: 'Income' as const,
      category: inc.source || inc.incomeType || 'Income',
      description: inc.description,
      bank: inc.bankName || 'Primary Account',
      paymentMethod: inc.paymentMethod || 'Bank Transfer',
      amount: Number(inc.amount),
      status: 'Completed',
      raw: inc,
    })),
    ...periodExpenses.map((exp: any) => ({
      id: exp._id ? exp._id.toString() : exp.id,
      date: exp.date,
      type: 'Expense' as const,
      category: exp.category,
      description: exp.description,
      bank: exp.bankName || 'Primary Account',
      paymentMethod: exp.paymentMethod || 'UPI',
      amount: Number(exp.amount),
      status: 'Completed',
      raw: exp,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 9. Upcoming Bills with Computed Real-Time Status
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);

  const upcomingBills = allBills.map((bill: any) => {
    const dueObj = new Date(bill.dueDate);
    dueObj.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24));
    let status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid' = bill.status || 'Upcoming';

    if (bill.isPaid) {
      status = 'Paid';
    } else if (diffDays < 0) {
      status = 'Overdue';
    } else if (diffDays === 0) {
      status = 'Due Today';
    } else {
      status = 'Upcoming';
    }

    return {
      id: bill._id ? bill._id.toString() : bill.id,
      billName: bill.billName,
      amount: Number(bill.amount),
      dueDate: bill.dueDate,
      status,
      category: bill.category || 'Utilities',
      accountName: bill.accountName || 'Primary Bank',
      isPaid: Boolean(bill.isPaid),
      diffDays,
    };
  });

  return {
    summary: {
      totalIncome,
      totalExpenses,
      balance,
      budget: budgetTotalLimit,
      budgetUsed: budgetSpent,
      budgetRemaining,
      budgetPercentage,
      budgetHealthStatus,
      monthlySavings,
      savingsRate,
      incomePctChange,
      expensePctChange,
      incomeTransactionsCount: periodIncomes.length,
      expenseTransactionsCount: periodExpenses.length,
      totalTransactionsCount: periodIncomes.length + periodExpenses.length,
    },
    goal: {
      id: (primaryGoal as any)._id ? (primaryGoal as any)._id.toString() : ((primaryGoal as any).id || 'g_1'),
      name: primaryGoal.title || (primaryGoal as any).goalName,
      title: primaryGoal.title || (primaryGoal as any).goalName,
      targetAmount: goalTarget,
      savedAmount: goalSaved,
      currentAmount: goalSaved,
      remainingAmount: goalRemaining,
      progress: goalProgress,
      targetDate: primaryGoal.targetDate,
      category: primaryGoal.category,
      priority: primaryGoal.priority,
      status: goalProgress >= 100 ? 'completed' : 'in_progress',
    },
    charts: {
      incomeVsExpense: incomeVsExpenseChart,
      balanceTrend: balanceTrendChart,
      expenseCategories: expenseCategoriesChart,
      incomeSources: incomeSourcesChart,
      cashFlow: cashFlowChart,
      savingsGrowth: savingsGrowthChart,
      weeklySpending: weeklySpendingChart,
    },
    analytics: {
      savingsRate,
      expenseRatio,
      averageDailySpending,
      averageMonthlyIncome,
      highestExpense,
      highestIncome,
      topExpenseCategory,
      topIncomeSource,
    },
    insights: dynamicInsights,
    recentTransactions: unifiedTransactions.slice(0, 10),
    allTransactions: unifiedTransactions,
    upcomingBills,
    notifications: allNotifications.map((n: any) => ({
      id: n._id ? n._id.toString() : n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      category: n.category,
      priority: n.priority,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
  };
};
