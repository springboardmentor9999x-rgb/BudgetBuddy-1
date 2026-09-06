export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Education & Books'
  | 'Entertainment & Fun'
  | 'Housing & Utilities'
  | 'Health & Wellness'
  | 'Personal Care'
  | 'Investments & Savings'
  | 'Miscellaneous';

export type IncomeSource =
  | 'Salary / Wages'
  | 'Freelance / Projects'
  | 'Investments & Dividends'
  | 'Part-time Work'
  | 'Allowance & Stipend'
  | 'Side Hustle'
  | 'Gifts & Rewards'
  | 'Other';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateToUSD: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'professional' | 'freelancer' | 'admin';
  monthlyIncomeGoal: number;
  currency: CurrencyCode;
  savingsTargetPercent: number;
  avatarUrl?: string;
}

export interface ExpenseItem {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string; // ISO YYYY-MM-DD
  paymentMethod?: 'UPI / Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Credit Card';
  notes?: string;
  createdAt: string;
}

export interface IncomeItem {
  id: string;
  userId: string;
  source: IncomeSource;
  amount: number;
  description: string;
  date: string; // ISO YYYY-MM-DD
  isRecurring?: boolean;
  notes?: string;
  createdAt: string;
}

export interface BudgetLimit {
  id: string;
  userId: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  monthYear: string; // YYYY-MM
  alertThresholdPercent?: number; // default 80%
}

export type TransferType = 'sent' | 'received' | 'charged' | 'split';
export type TransferStatus = 'completed' | 'pending' | 'settled';

export interface PersonTransfer {
  id: string;
  userId: string;
  personName: string;
  personAvatar?: string;
  type: TransferType; // 'sent' (money sent to person), 'received' (person sent to me), 'charged' (I charged person), 'split' (group bill split)
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  status: TransferStatus;
  paymentMode: 'UPI' | 'Bank Transfer' | 'Card' | 'Cash' | 'Digital Wallet';
  referenceNote?: string;
  createdAt: string;
}

export interface PaymentCard {
  id: string;
  userId: string;
  cardName: string;
  bankName: string;
  cardType: 'credit' | 'debit' | 'wallet' | 'bank_account';
  last4: string;
  balanceOrDue: number;
  creditLimit?: number;
  expiryMonthYear: string;
  isFrozen: boolean;
  colorTheme: 'obsidian' | 'sapphire' | 'emerald' | 'platinum' | 'sunset' | 'indigo';
  billingDay?: number;
  network?: 'Visa' | 'Mastercard' | 'RuPay' | 'Amex';
}

export type GoalStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDate: string; // YYYY-MM-DD
  colorTheme: string;
  status: GoalStatus;
  icon?: string;
  createdAt: string;
}

export interface NotificationMessage {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  createdAt: string;
}

export interface TransactionUnified {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  categoryOrSource: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  personName?: string;
}

export interface BudgetUtilization {
  category: ExpenseCategory;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyDashboardData {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  budgetTotalLimit: number;
  budgetTotalSpent: number;
  budgetUtilizationRate: number;
  topCategories: CategorySummary[];
  recentTransactions: TransactionUnified[];
  categoryBreakdown: CategorySummary[];
  budgetStatuses: BudgetUtilization[];
  p2pNetBalance: number;
}
