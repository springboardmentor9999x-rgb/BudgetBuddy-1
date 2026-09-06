export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Rent'
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Travel'
  | 'Insurance'
  | 'EMI/Loan'
  | 'Food & Dining'
  | 'Transportation'
  | 'Housing & Utilities'
  | 'Health & Wellness'
  | 'Education & Books'
  | 'Entertainment & Fun'
  | 'Investments & Savings'
  | 'Personal Care'
  | 'Miscellaneous'
  | 'Other';

export type IncomeType =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Bonus'
  | 'Interest'
  | 'Gift'
  | 'Rental'
  | 'Other'
  | 'Salary / Wages'
  | 'Freelance / Projects'
  | 'Investments & Dividends'
  | 'Part-time Work'
  | 'Allowance & Stipend'
  | 'Side Hustle'
  | 'Gifts & Rewards';

export type IncomeSource = IncomeType;

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateToUSD: number;
}

export type UserRole =
  | 'user'
  | 'premium'
  | 'admin'
  | 'super_admin'
  | 'student'
  | 'professional'
  | 'freelancer';

export type AccountStatus = 'active' | 'suspended' | 'pending';
export type PremiumStatus = 'NONE' | 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  phone?: string;
  role: UserRole;
  accountStatus?: AccountStatus;
  monthlyIncomeGoal: number;
  currency: CurrencyCode;
  savingsTargetPercent: number;
  avatarUrl?: string;
  is_verified?: boolean;

  // Premium Tier Attributes
  premiumStatus?: PremiumStatus;
  premiumPlan?: string; // 'FREE' | 'MONTHLY' | 'YEARLY'
  premiumStartedAt?: string;
  premiumExpiresAt?: string;
  customCategories?: string[];

  // Security & Audit
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseItem {
  id: string;
  userId: string;
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  description: string;
  date: string; // ISO YYYY-MM-DD
  paymentMethod?: 'Cash' | 'UPI' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Net Banking' | 'Digital Wallet' | 'UPI / Card';
  accountId?: string;
  bankName?: string;
  recurring?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | boolean;
  notes?: string;
  createdAt: string;
}

export interface IncomeItem {
  id: string;
  userId: string;
  source: IncomeType;
  incomeType?: IncomeType;
  amount: number;
  description: string;
  date: string; // ISO YYYY-MM-DD
  paymentMethod?: string;
  accountId?: string;
  bankName?: string;
  isRecurring?: boolean;
  recurring?: boolean;
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
  type: TransferType;
  amount: number;
  category: string;
  date: string;
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

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  name?: string;
  targetAmount: number;
  currentAmount: number;
  category: 'Emergency' | 'Vacation' | 'Investments' | 'Vehicle' | 'Property' | 'Gadget' | 'Laptop' | 'Bike' | 'Car' | 'Education' | 'House' | 'General';
  targetDate: string; // YYYY-MM-DD
  priority?: 'High' | 'Medium' | 'Low';
  allowOverfunding?: boolean;
  colorTheme?: 'emerald' | 'indigo' | 'sunset' | 'cyan' | 'violet' | 'amber';
  description?: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  bankName: string;
  accountType: 'Savings' | 'Checking' | 'Credit Card' | 'Wallet' | 'UPI';
  balance: number;
  lastFourDigits: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'budget_warning' | 'budget_exceeded' | 'goal_deadline' | 'goal_completed' | 'large_expense' | 'report_ready' | 'info';
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
  paymentMethod?: string;
  bankName?: string;
  status?: string;
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

export interface FinancialHealthScore {
  score: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  savingsRateScore: number;
  budgetAdherenceScore: number;
  expenseToIncomeRatioScore: number;
  goalProgressScore: number;
  insights: string[];
}

export interface MonthlyDashboardData {
  totalIncome: number;
  prevMonthIncome: number;
  incomePctChange: number;
  totalExpenses: number;
  prevMonthExpenses: number;
  expensePctChange: number;
  currentBalance: number;
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
  savingsGoals: SavingsGoal[];
  financialHealth: FinancialHealthScore;
}
