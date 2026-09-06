import { apiClient } from './api';

export interface DashboardResponse {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    budget: number;
    budgetUsed: number;
    budgetRemaining: number;
    budgetPercentage: number;
    budgetHealthStatus?: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Budget Exceeded';
    monthlySavings: number;
    savingsRate: number;
    incomePctChange: number;
    expensePctChange: number;
    incomeTransactionsCount: number;
    expenseTransactionsCount: number;
    totalTransactionsCount: number;
  };
  goal: {
    id?: string;
    name: string;
    title?: string;
    targetAmount: number;
    savedAmount: number;
    currentAmount?: number;
    remainingAmount: number;
    progress: number;
    targetDate?: string;
    status?: string;
  };
  charts: {
    incomeVsExpense: Array<{ month: string; income: number; expenses: number }>;
    balanceTrend: Array<{ month: string; balance: number }>;
    expenseCategories: Array<{ name: string; amount: number; percentage: number }>;
    incomeSources: Array<{ name: string; amount: number; percentage: number }>;
    cashFlow: Array<{ month: string; income: number; expenses: number; balance: number }>;
    savingsGrowth: Array<{ month: string; cumulative: number }>;
    weeklySpending: Array<{ day: string; shortDay: string; amount: number }>;
  };
  analytics: {
    savingsRate: number;
    expenseRatio: number;
    averageDailySpending: number;
    averageMonthlyIncome: number;
    highestExpense: { description: string; category: string; amount: number } | null;
    highestIncome: { description: string; source: string; amount: number } | null;
    topExpenseCategory: { category: string; amount: number } | null;
    topIncomeSource: { source: string; amount: number } | null;
  };
  insights: Array<{ id: string; icon: string; text: string; type: 'info' | 'warning' | 'success' }>;
  recentTransactions: Array<{
    id: string;
    date: string;
    type: 'Income' | 'Expense';
    category: string;
    description: string;
    bank: string;
    paymentMethod: string;
    amount: number;
    status: string;
  }>;
  upcomingBills: Array<{
    id: string;
    billName: string;
    amount: number;
    dueDate: string;
    status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid';
    category: string;
    accountName: string;
    isPaid: boolean;
    diffDays?: number;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    category: string;
    priority: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export const dashboardApi = {
  async getDashboard(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    monthYear?: string;
  }): Promise<DashboardResponse> {
    const res = await apiClient.get('/dashboard', { params });
    return res.data.data || res.data;
  },

  async getSummary(params?: Record<string, any>) {
    const res = await apiClient.get('/dashboard/summary', { params });
    return res.data.summary;
  },

  async getCharts(params?: Record<string, any>) {
    const res = await apiClient.get('/dashboard/charts', { params });
    return res.data.charts;
  },

  async getAnalytics(params?: Record<string, any>) {
    const res = await apiClient.get('/dashboard/analytics', { params });
    return res.data.analytics;
  },
};
