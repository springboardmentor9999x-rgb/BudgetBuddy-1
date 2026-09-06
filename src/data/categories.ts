import { ExpenseCategory, IncomeSource, CurrencyCode, CurrencyConfig } from '../types/budget';

export interface CategoryMeta {
  name: ExpenseCategory;
  color: string;
  bgColor: string;
  borderColor: string;
  chartColor: string;
  iconName: string;
  ruleType: 'Needs' | 'Wants' | 'Savings';
  description: string;
}

export const EXPENSE_CATEGORIES_META: Record<ExpenseCategory, CategoryMeta> = {
  'Food & Dining': {
    name: 'Food & Dining',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    chartColor: '#f59e0b',
    iconName: 'Utensils',
    ruleType: 'Needs',
    description: 'Groceries, restaurants, snacks, cafes & takeout',
  },
  'Housing & Utilities': {
    name: 'Housing & Utilities',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    chartColor: '#3b82f6',
    iconName: 'Home',
    ruleType: 'Needs',
    description: 'Rent, electricity, water, internet, maintenance',
  },
  'Transportation': {
    name: 'Transportation',
    color: 'text-cyan-700 dark:text-cyan-300',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    chartColor: '#06b6d4',
    iconName: 'Car',
    ruleType: 'Needs',
    description: 'Fuel, metro, buses, cabs, parking & vehicle service',
  },
  'Shopping': {
    name: 'Shopping',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    chartColor: '#a855f7',
    iconName: 'ShoppingBag',
    ruleType: 'Wants',
    description: 'Clothing, gadgets, accessories & home items',
  },
  'Entertainment & Fun': {
    name: 'Entertainment & Fun',
    color: 'text-pink-700 dark:text-pink-300',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800',
    chartColor: '#ec4899',
    iconName: 'Film',
    ruleType: 'Wants',
    description: 'Movies, gaming, subscriptions, concerts & outings',
  },
  'Education & Books': {
    name: 'Education & Books',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    chartColor: '#10b981',
    iconName: 'GraduationCap',
    ruleType: 'Needs',
    description: 'Tuition, textbooks, courses, certifications',
  },
  'Health & Wellness': {
    name: 'Health & Wellness',
    color: 'text-rose-700 dark:text-rose-300',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
    chartColor: '#f43f5e',
    iconName: 'HeartPulse',
    ruleType: 'Needs',
    description: 'Medicine, gym membership, doctor visits, pharmacy',
  },
  'Personal Care': {
    name: 'Personal Care',
    color: 'text-teal-700 dark:text-teal-300',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
    chartColor: '#14b8a6',
    iconName: 'Sparkles',
    ruleType: 'Wants',
    description: 'Salon, grooming, skincare, laundry & self-care',
  },
  'Investments & Savings': {
    name: 'Investments & Savings',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    chartColor: '#6366f1',
    iconName: 'TrendingUp',
    ruleType: 'Savings',
    description: 'Mutual funds, emergency fund, stocks & deposits',
  },
  'Miscellaneous': {
    name: 'Miscellaneous',
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60',
    borderColor: 'border-slate-300 dark:border-slate-700',
    chartColor: '#64748b',
    iconName: 'MoreHorizontal',
    ruleType: 'Wants',
    description: 'Uncategorized, random one-offs & unexpected costs',
  },
};

export const INCOME_SOURCES: IncomeSource[] = [
  'Salary / Wages',
  'Freelance / Projects',
  'Investments & Dividends',
  'Part-time Work',
  'Allowance & Stipend',
  'Side Hustle',
  'Gifts & Rewards',
  'Other',
];

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR ₹)', rateToUSD: 0.012 },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar (USD $)', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (EUR €)', rateToUSD: 1.08 },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (GBP £)', rateToUSD: 1.28 },
  CAD: { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (CAD C$)', rateToUSD: 0.74 },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (AUD A$)', rateToUSD: 0.66 },
  JPY: { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY ¥)', rateToUSD: 0.0067 },
};

export function formatMoney(amount?: number | null, currency?: string): string {
  const code = (currency as CurrencyCode) || 'INR';
  const cfg = CURRENCIES[code] || CURRENCIES.INR;
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${cfg.symbol}${num.toLocaleString(undefined, {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

