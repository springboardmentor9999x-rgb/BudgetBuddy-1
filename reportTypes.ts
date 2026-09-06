export type ReportPeriod =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'all_time'
  | 'custom';

export type ReportCategoryTab =
  | 'all'
  | 'income'
  | 'expenses'
  | 'transactions'
  | 'savings-goals'
  | 'accounts'
  | 'cards'
  | 'transfers';

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
  expenseRatio: number;
  totalBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
  budgetHealthStatus: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Exceeded';
  incomeTransactionsCount: number;
  expenseTransactionsCount: number;
  totalTransactionsCount: number;
}

export interface BudgetReportCategory {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Exceeded';
}

export interface BudgetReportData {
  totalBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
  budgetHealthStatus: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Exceeded';
  categories: BudgetReportCategory[];
}

export interface SavingsGoalReportItem {
  id: string;
  title: string;
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progress: number;
  targetDate: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Completed' | 'In Progress';
  colorTheme?: string;
  notes?: string;
}

export interface IncomeReportRecord {
  id: string;
  date: string;
  source: string;
  incomeType: string;
  bank: string;
  bankName: string;
  paymentMethod: string;
  description: string;
  amount: number;
  notes?: string;
}

export interface IncomeReportData {
  total: number;
  count: number;
  average: number;
  highest: {
    id: string;
    source: string;
    description: string;
    amount: number;
    date: string;
    bankName: string;
    paymentMethod: string;
  } | null;
  lowest: {
    id: string;
    source: string;
    description: string;
    amount: number;
    date: string;
    bankName: string;
    paymentMethod: string;
  } | null;
  bySource: Array<{ name: string; source: string; amount: number; percentage: number }>;
  byType: Array<{ name: string; type: string; amount: number; percentage: number }>;
  monthly: Array<{ month: string; monthKey: string; amount: number; income: number }>;
  records: IncomeReportRecord[];
}

export interface ExpenseReportRecord {
  id: string;
  date: string;
  category: string;
  expenseType: string;
  bank: string;
  bankName: string;
  paymentMethod: string;
  description: string;
  amount: number;
  notes?: string;
}

export interface ExpenseReportData {
  total: number;
  count: number;
  average: number;
  highest: {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    bankName: string;
    paymentMethod: string;
  } | null;
  lowest: {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    bankName: string;
    paymentMethod: string;
  } | null;
  byCategory: Array<{ name: string; category: string; amount: number; percentage: number }>;
  byBank: Array<{ name: string; bank: string; amount: number; percentage: number }>;
  byPaymentMethod: Array<{ name: string; paymentMethod: string; amount: number; percentage: number }>;
  monthly: Array<{ month: string; monthKey: string; amount: number; expenses: number }>;
  records: ExpenseReportRecord[];
}

export interface CashFlowReportData {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  chart: Array<{
    month: string;
    monthKey: string;
    cashIn: number;
    cashOut: number;
    income: number;
    expenses: number;
    netCashFlow: number;
    balance: number;
  }>;
}

export interface TransactionReportItem {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  bank: string;
  paymentMethod: string;
  amount: number;
}

export interface BillReportItem {
  id: string;
  billName: string;
  dueDate: string;
  amount: number;
  status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid';
  category: string;
  accountName: string;
  isPaid: boolean;
  diffDays?: number;
}

export interface AccountReportItem {
  id: string;
  name: string;
  bankName: string;
  accountType: 'Savings' | 'Checking' | 'Credit Card' | 'Wallet' | 'UPI';
  balance: number;
  lastFourDigits: string;
  notes?: string;
  createdAt: string;
}

export interface CardReportItem {
  id: string;
  cardName: string;
  bankName: string;
  cardType: 'credit' | 'debit' | 'wallet' | 'bank_account';
  last4: string;
  balanceOrDue: number;
  creditLimit?: number;
  expiryMonthYear: string;
  isFrozen: boolean;
  colorTheme: string;
  billingDay?: number;
  network?: string;
}

export interface TransferReportItem {
  id: string;
  personName: string;
  type: 'sent' | 'received' | 'charged' | 'split';
  amount: number;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'settled';
  paymentMode: string;
  referenceNote?: string;
  createdAt: string;
}

export interface FinancialAnalysisData {
  savingsRate: number;
  expenseRatio: number;
  averageDailySpending: number;
  averageIncome: number;
  averageExpense: number;
  highestExpense: {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    bankName: string;
    paymentMethod: string;
  } | null;
  highestIncome: {
    id: string;
    source: string;
    description: string;
    amount: number;
    date: string;
    bankName: string;
    paymentMethod: string;
  } | null;
  lowestExpense: {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
  } | null;
  lowestIncome: {
    id: string;
    source: string;
    description: string;
    amount: number;
    date: string;
  } | null;
  periodDays: number;
}

export interface FinancialInsightItem {
  id: string;
  icon: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export interface ReportChartsData {
  incomeVsExpense: Array<{
    month: string;
    monthKey: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
  balanceTrend: Array<{
    month: string;
    monthKey: string;
    balance: number;
    income: number;
    expenses: number;
  }>;
  cashFlow: Array<{
    month: string;
    monthKey: string;
    cashIn: number;
    cashOut: number;
    income: number;
    expenses: number;
    netCashFlow: number;
    balance: number;
  }>;
  incomeSources: Array<{ name: string; amount: number; percentage: number }>;
  expenseCategories: Array<{ name: string; amount: number; percentage: number }>;
  monthlyIncome: Array<{ month: string; amount: number }>;
  monthlyExpense: Array<{ month: string; amount: number }>;
}

export interface ReportResponse {
  success: boolean;
  lastUpdated: string;
  period: {
    periodType: ReportPeriod;
    startDate: string;
    endDate: string;
  };
  summary: ReportSummary;
  budgetReport: BudgetReportData;
  savingsGoals: SavingsGoalReportItem[];
  income: IncomeReportData;
  expenses: ExpenseReportData;
  cashFlow: CashFlowReportData;
  transactions: TransactionReportItem[];
  upcomingBills: BillReportItem[];
  accounts?: AccountReportItem[];
  cards?: CardReportItem[];
  transfers?: TransferReportItem[];
  financialAnalysis: FinancialAnalysisData;
  financialInsights: FinancialInsightItem[];
  charts: ReportChartsData;
}
