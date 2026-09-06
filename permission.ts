export type FeatureCategory = 'BUDGET' | 'ANALYTICS' | 'REPORTS' | 'PREMIUM';

export interface FeaturePermissionDoc {
  id?: string;
  _id?: string;
  feature: string;
  name: string;
  description: string;
  category: FeatureCategory;
  freeUser: boolean;
  premiumUser: boolean;
  enabled: boolean;
  isPremiumFeature?: boolean;
  updatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface PermissionHistoryDoc {
  id?: string;
  _id?: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  feature: string;
  featureName: string;
  category: string;
  changeType: 'TOGGLE_ENABLED' | 'TOGGLE_FREE' | 'TOGGLE_PREMIUM' | 'RESET_DEFAULTS' | 'BULK_UPDATE';
  previousValue: string;
  newValue: string;
  action: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PermissionDashboardStats {
  totalNormalUsers: number;
  totalPremiumUsers: number;
  totalFreeUsers: number;
  totalFeatures: number;
  totalEnabledFeatures: number;
  totalDisabledFeatures: number;
  enabledPremiumFeatures: number;
  enabledBudgetFeatures: number;
  enabledAnalyticsFeatures: number;
  enabledReportFeatures: number;
}

export interface UserPermissionsResponse {
  success: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  permissions: Record<
    string,
    {
      enabled: boolean;
      freeUser: boolean;
      premiumUser: boolean;
      accessible: boolean;
    }
  >;
  rawList: FeaturePermissionDoc[];
}
