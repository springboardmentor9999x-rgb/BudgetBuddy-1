export interface AdminDashboardStats {
  totalRegisteredUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalPremiumUsers: number;
  totalFreeUsers: number;
  totalTransactions: number;
  totalIncomeRecords: number;
  totalExpenseRecords: number;
  totalBudgets: number;
  totalSavingsGoals: number;
  totalReports: number;
  totalNotifications: number;
  revenue: {
    totalRevenue: number;
    mrr: number;
    arr: number;
    arpu: number;
    currency: string;
  };
  system: {
    status: string;
    database: string;
    uptime: number;
    memoryUsageMB: number;
    version: string;
  };
}

export interface AdminUserDoc {
  id?: string;
  _id?: string;
  name: string;
  fullName: string;
  email: string;
  role: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  is_verified: boolean;
  currency: string;
  monthlyIncomeGoal?: number;
  savingsTargetPercent?: number;
  premiumStatus?: 'NONE' | 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE' | 'INACTIVE';
  premiumPlan?: string;
  premiumStartedAt?: string;
  premiumExpiresAt?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSubscriptionDoc {
  id?: string;
  _id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId?: string;
  planName: string;
  planCode: string;
  billingPeriod: string;
  amount: number;
  currency: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE' | 'INACTIVE';
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  paymentProvider: string;
  paymentId?: string;
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
}

export interface AdminPlanDoc {
  id?: string;
  _id?: string;
  name: string;
  planCode: string;
  price: number;
  currency: string;
  billingPeriod: 'free' | 'monthly' | 'yearly';
  durationDays: number;
  features: string[];
  status: 'active' | 'inactive' | 'archived';
  isPopular?: boolean;
}

export interface AdminFinanceOverviewDoc {
  totalTransactions: number;
  totalIncomeRecords: number;
  totalExpenseRecords: number;
  totalIncomeVolume: number;
  totalExpenseVolume: number;
  netPlatformFlow: number;
  financialTrends: Array<{
    month: string;
    incomeVolume: number;
    expenseVolume: number;
    transactionCount: number;
  }>;
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  topIncomeCategories: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  savingsGoals: {
    totalGoals: number;
    totalTargetAmount: number;
    totalSavedAmount: number;
    completionPercent: number;
  };
}

export interface AdminReportDoc {
  id?: string;
  _id?: string;
  title: string;
  reportType:
    | 'USERS_DIRECTORY'
    | 'SUBSCRIPTIONS_REVENUE'
    | 'FINANCE_AGGREGATION'
    | 'SECURITY_AUDIT'
    | 'SYSTEM_DIAGNOSTIC'
    | 'CUSTOM';
  format: 'CSV' | 'JSON' | 'PDF';
  status: 'GENERATED' | 'PENDING' | 'FAILED';
  generatedBy: string;
  fileSize?: string;
  recordCount?: number;
  downloadUrl?: string;
  errorMessage?: string;
  generatedAt: string;
  createdAt?: string;
}

export interface SecurityEventDoc {
  id?: string;
  _id?: string;
  type:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'OTP_FAILURE'
    | 'SUSPICIOUS_LOGIN'
    | 'SESSION_REVOKED'
    | 'PASSWORD_RESET'
    | 'RATE_LIMIT_HIT';
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details: string;
  timestamp: string;
}

export interface AdminSessionDoc {
  id?: string;
  _id?: string;
  sessionId: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  location: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  lastActiveAt: string;
}

export interface AdminAuditLogDoc {
  id?: string;
  _id?: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  result: 'SUCCESS' | 'FAILED';
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminSystemSettingsDoc {
  id?: string;
  _id?: string;
  appName: string;
  appDescription: string;
  registrationEnabled: boolean;
  premiumRegistrationEnabled: boolean;
  maintenanceMode: boolean;
  emailVerificationRequired: boolean;
  defaultCurrency: string;
  supportEmail: string;
  systemNotice?: string;
  otpExpirationDuration: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
  rateLimitPerMinute: number;
  notificationSettings?: {
    emailAlerts: boolean;
    pushAlerts: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
  };
}

export interface AdminNotificationDoc {
  id?: string;
  _id?: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'sent' | 'scheduled' | 'draft';
  targetAudience?: 'all' | 'free' | 'premium' | 'admin';
  scheduledAt?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface AdminAlertDoc {
  id: string;
  title: string;
  message: string;
  category: 'growth' | 'security' | 'reports' | 'premium' | 'maintenance';
  time: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AdminCategoryDoc {
  id?: string;
  _id?: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  status: 'active' | 'disabled';
}
