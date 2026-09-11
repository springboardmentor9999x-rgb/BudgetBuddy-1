export interface ReportSummaryMetrics {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
  total_transactions_count: number;
  income_count: number;
  expense_count: number;
  avg_income_transaction: number;
  avg_expense_transaction: number;
  max_income: number;
  max_expense: number;
  period_label: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ReportCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ReportSourceBreakdown {
  source: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ReportAccountBreakdown {
  account: string;
  income_amount: number;
  expense_amount: number;
  net_amount: number;
  transaction_count: number;
}

export interface ReportTimelineItem {
  label: string;
  date_key: string;
  income: number;
  expenses: number;
  net: number;
}

export interface ReportUserOption {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
}

export interface ReportTransactionItem {
  id: number;
  type: 'income' | 'expense';
  date: string;
  category_or_source: string;
  description: string | null;
  account: string;
  amount: number;
  user_id?: number;
  user_email?: string | null;
}

export interface ReportDataResponse {
  summary: ReportSummaryMetrics;
  category_breakdown: ReportCategoryBreakdown[];
  source_breakdown: ReportSourceBreakdown[];
  account_breakdown: ReportAccountBreakdown[];
  timeline_breakdown: ReportTimelineItem[];
  transactions: ReportTransactionItem[];
  available_years: number[];
  available_categories: string[];
  available_accounts: string[];
  available_users?: ReportUserOption[] | null;
  selected_user_id?: number | null;
}

export interface ReportFilterState {
  period_type: 'month' | 'year' | 'custom' | 'all';
  month: number;
  year: number;
  start_date: string;
  end_date: string;
  transaction_type: 'all' | 'income' | 'expense';
  category: string;
  account: string;
  user_id?: string | number;
}
