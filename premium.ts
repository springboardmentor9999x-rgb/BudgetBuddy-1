export interface PremiumPlan {
  id?: string;
  _id?: string;
  name: string;
  planCode: string;
  price: number;
  currency: string;
  billingPeriod: 'free' | 'monthly' | 'yearly';
  durationDays: number;
  features: string[];
  status: 'active' | 'inactive';
  isPopular?: boolean;
}

export interface UserSubscriptionState {
  isPremium: boolean;
  premiumStatus: 'NONE' | 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';
  plan: string;
  startedAt?: string;
  expiresAt?: string;
  daysRemaining: number;
  subscription?: {
    id?: string;
    planName: string;
    billingPeriod: string;
    amount: number;
    status: string;
    paymentProvider: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  };
}

export interface FinancialHealthScoreResponse {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: {
    savingsRate: { score: number; max: number; value: string };
    budgetAdherence: { score: number; max: number; value: string };
    expenseToIncome: { score: number; max: number; value: string };
    goalProgress: { score: number; max: number; value: string };
    cashFlowStability: { score: number; max: number; value: string };
  };
  insights: string[];
  disclaimer: string;
}

export interface FinancialInsightItem {
  id: string;
  type: 'positive' | 'warning' | 'tip' | 'goal';
  icon: string;
  title: string;
  description: string;
  tag: string;
}

export interface GoalForecastItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  estimatedCompletionDate: string;
  monthsRemaining: number;
  status: 'imminent' | 'on_track' | 'slow';
}

export interface BudgetForecastItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  projectedMonthEndSpend: number;
  projectedVariance: number;
  willExceed: boolean;
  depletionDay?: number | null;
}

export interface NetWorthProjectionItem {
  month: string;
  projectedNetWorth: number;
  monthlySurplus: number;
}

export interface ForecastsResponse {
  goalForecasts: GoalForecastItem[];
  budgetForecasts: BudgetForecastItem[];
  netWorthProjection: NetWorthProjectionItem[];
  monthlySurplus: number;
  disclaimer: string;
}

export interface ScheduledReportItem {
  id?: string;
  _id?: string;
  reportType: 'monthly' | 'income' | 'expense' | 'budget' | 'savings' | 'cash_flow' | 'summary';
  frequency: 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'csv' | 'excel';
  isActive: boolean;
  nextRunAt: string;
}
