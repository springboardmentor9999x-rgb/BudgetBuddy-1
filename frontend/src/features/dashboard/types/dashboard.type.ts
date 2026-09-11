/**
 * TypeScript interface definitions for Dashboard API responses and UI models.
 */

export interface UserStats {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  monthly_change: number;
  balance_change: number;
  income_change: number;
  expense_change: number;
}

export interface WeeklyOverview {
  labels: string[];
  income_data: number[];
  expense_data: number[];
}

export interface CategorySpendingItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyBreakdownItem {
  month: string;
  year: number;
  income: number;
  expenses: number;
  savings: number;
}

export interface MonthlyOverview {
  current_month: string;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  monthly_change_pct: number;
  monthly_breakdown: MonthlyBreakdownItem[];
}

export interface RecentTransaction {
  id: number;
  type: 'income' | 'expense' | string;
  description: string;
  amount: number;
  category: string;
  date: string;
  account: string;
}

export interface DashboardStatsResponse {
  user_stats: UserStats;
  weekly_overview: WeeklyOverview;
  monthly_overview: MonthlyOverview;
  category_spending: CategorySpendingItem[];
  recent_transactions: RecentTransaction[];
}
