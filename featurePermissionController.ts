import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { FeaturePermissionModel, IFeaturePermission, FeatureCategory } from '../models/FeaturePermission';
import { PermissionHistoryModel } from '../models/PermissionHistory';
import { UserModel } from '../models/User';

export interface DefaultFeatureConfig {
  feature: string;
  name: string;
  description: string;
  category: FeatureCategory;
  freeUser: boolean;
  premiumUser: boolean;
  enabled: boolean;
  isPremiumFeature: boolean;
}

export const DEFAULT_FEATURE_PERMISSIONS: DefaultFeatureConfig[] = [
  // ---------------------------------------------------------------------------
  // 1. BUDGET PERMISSIONS
  // ---------------------------------------------------------------------------
  {
    feature: 'budget.create',
    name: 'Create Budget',
    description: 'Create new monthly or custom budget envelopes',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.view',
    name: 'View Budget',
    description: 'Inspect active budgets and spent balance progress',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.edit',
    name: 'Edit Budget',
    description: 'Modify budget limits, category mappings, and thresholds',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.delete',
    name: 'Delete Budget',
    description: 'Remove existing budgets and reset allocations',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.set_amount',
    name: 'Set Budget Amount',
    description: 'Configure maximum spend caps per category',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.set_category',
    name: 'Set Budget Category',
    description: 'Assign standard and custom categories to budgets',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.set_period',
    name: 'Set Budget Period',
    description: 'Define monthly and cyclical budget recurrence',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.progress',
    name: 'View Budget Progress',
    description: 'Visual progress bars and real-time expense consumption',
    category: 'BUDGET',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'budget.multiple',
    name: 'Multiple Budgets',
    description: 'Create unlimited concurrent budgets across all categories',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.analytics',
    name: 'Advanced Budget Analytics',
    description: 'Deep-dive analysis on category overshoot and burn rates',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.forecast',
    name: 'Budget Forecasting',
    description: 'Predict month-end budget variance using historical run-rate',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.recommendations',
    name: 'Budget Recommendations',
    description: 'AI recommendations for optimal category allocations',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.alerts',
    name: 'Spending Limit Alerts',
    description: 'Automated 80%, 90% and 100% threshold notifications',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.vs_actual',
    name: 'Budget vs Actual Analysis',
    description: 'Side-by-side comparison of planned versus realized expenses',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.category_analysis',
    name: 'Category-wise Budget Analysis',
    description: 'Breakdown of budget health across individual categories',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.comparison',
    name: 'Monthly Budget Comparison',
    description: 'Compare budget discipline across previous months and quarters',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.custom_periods',
    name: 'Custom Budget Periods',
    description: 'Set custom bi-weekly, weekly, or event-based budgets',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.reports',
    name: 'Advanced Budget Reports',
    description: 'Comprehensive budget performance and utilization summaries',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.export',
    name: 'Budget Export',
    description: 'Export budget tables and variance data to CSV and PDF',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'budget.trends',
    name: 'Budget Performance Trends',
    description: 'Longitudinal graphs of budget compliance over time',
    category: 'BUDGET',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },

  // ---------------------------------------------------------------------------
  // 2. ANALYTICS PERMISSIONS
  // ---------------------------------------------------------------------------
  {
    feature: 'analytics.basic',
    name: 'Basic Analytics',
    description: 'Standard income, expense totals, and top categories',
    category: 'ANALYTICS',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'analytics.advanced',
    name: 'Advanced Analytics',
    description: 'Comprehensive financial breakdowns and multidimensional charts',
    category: 'ANALYTICS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'analytics.custom_range',
    name: 'Custom Date Range Analytics',
    description: 'Filter metrics by arbitrary start and end dates',
    category: 'ANALYTICS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'analytics.trends',
    name: 'Monthly Income vs Expense Trends',
    description: 'Multi-month trend lines comparing inflow and outflow',
    category: 'ANALYTICS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'analytics.income_vs_expense',
    name: 'Income vs Expense Analysis',
    description: 'High-level net savings ratio and cash-flow overview',
    category: 'ANALYTICS',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'analytics.category_analysis',
    name: 'Category Analysis',
    description: 'Detailed category breakdown with percentage distribution',
    category: 'ANALYTICS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'analytics.savings_analysis',
    name: 'Savings Trend Analysis',
    description: 'Cumulative wealth growth and savings rate velocity',
    category: 'ANALYTICS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'analytics.financial_trends',
    name: 'Financial Trends',
    description: 'Macro spending habits, seasonal shifts, and recurring patterns',
    category: 'ANALYTICS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },

  // ---------------------------------------------------------------------------
  // 3. REPORT PERMISSIONS
  // ---------------------------------------------------------------------------
  {
    feature: 'reports.basic',
    name: 'Basic Reports',
    description: 'Summary financial statements for the current month',
    category: 'REPORTS',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'reports.advanced',
    name: 'Advanced Reports',
    description: 'Multi-period audited financial reports with itemized ledger',
    category: 'REPORTS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'reports.pdf_export',
    name: 'PDF Export',
    description: 'Generate high-resolution printable PDF financial reports',
    category: 'REPORTS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'reports.excel_export',
    name: 'Excel Export',
    description: 'Export transaction registers and budgets to Microsoft Excel (.xlsx)',
    category: 'REPORTS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'reports.budget_reports',
    name: 'Budget Reports',
    description: 'Dedicated reports analyzing historical envelope adherence',
    category: 'REPORTS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'reports.income_reports',
    name: 'Income Reports',
    description: 'Detailed monthly income stream audits',
    category: 'REPORTS',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'reports.expense_reports',
    name: 'Expense Reports',
    description: 'Detailed monthly expense breakdown audits',
    category: 'REPORTS',
    freeUser: true,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: false,
  },
  {
    feature: 'reports.financial_analysis',
    name: 'Financial Analysis Reports',
    description: 'Holistic wealth health and net-worth tracking reports',
    category: 'REPORTS',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },

  // ---------------------------------------------------------------------------
  // 4. PREMIUM PERMISSIONS
  // ---------------------------------------------------------------------------
  {
    feature: 'premium.features',
    name: 'Premium Dashboard',
    description: 'Access to the unified Premium subscriber dashboard',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.analytics',
    name: 'Advanced Analytics',
    description: 'Full unlocking of all specialized analytics widgets',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.budget',
    name: 'Advanced Budget Analysis',
    description: 'Full suite of multiple budgets, forecasting, and burn rate tools',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.reports',
    name: 'Advanced Reports',
    description: 'Scheduled, automated, and custom range report generation',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.export',
    name: 'PDF & Excel Export',
    description: 'Uncapped exports in both PDF and spreadsheet formats',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.insights',
    name: 'Advanced Financial Insights',
    description: 'AI-driven financial recommendations and anomaly detection',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.spending_insights',
    name: 'Spending Insights',
    description: 'Smart insights on discretionary vs essential expenditures',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
  {
    feature: 'premium.notifications',
    name: 'Advanced Notifications',
    description: 'Custom email alerts, webhook triggers, and priority push updates',
    category: 'PREMIUM',
    freeUser: false,
    premiumUser: true,
    enabled: true,
    isPremiumFeature: true,
  },
];

/**
 * Ensures all default feature permissions are populated in MongoDB on startup.
 */
export const seedDefaultFeaturePermissions = async () => {
  try {
    const existingCount = await FeaturePermissionModel.countDocuments();
    if (existingCount === 0) {
      console.log('[FeaturePermissions] Seeding default feature permission matrix...');
      await FeaturePermissionModel.insertMany(DEFAULT_FEATURE_PERMISSIONS);
      console.log(`[FeaturePermissions] Seeded ${DEFAULT_FEATURE_PERMISSIONS.length} default feature permissions.`);
    } else {
      // Upsert any missing new features from default set
      for (const item of DEFAULT_FEATURE_PERMISSIONS) {
        const found = await FeaturePermissionModel.findOne({ feature: item.feature });
        if (!found) {
          await FeaturePermissionModel.create(item);
        }
      }
    }
  } catch (error) {
    console.error('[FeaturePermissions] Error seeding permissions:', error);
  }
};

/**
 * GET /api/admin/permissions
 * Fetches all feature permissions for Admin with aggregated metrics.
 */
export const getAllPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await seedDefaultFeaturePermissions();

    const { category, search, enabled } = req.query;
    const filter: any = {};

    if (category && category !== 'ALL') {
      filter.category = (category as string).toUpperCase();
    }
    if (enabled !== undefined && enabled !== 'all') {
      filter.enabled = enabled === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { feature: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const permissions = await FeaturePermissionModel.find(filter).sort({ category: 1, name: 1 });

    // Calculate aggregated metrics
    const allDocs = await FeaturePermissionModel.find();
    const totalFeatures = allDocs.length;
    const totalEnabled = allDocs.filter((p) => p.enabled).length;
    const totalDisabled = allDocs.filter((p) => !p.enabled).length;

    const enabledPremium = allDocs.filter((p) => p.enabled && p.category === 'PREMIUM').length;
    const enabledBudget = allDocs.filter((p) => p.enabled && p.category === 'BUDGET').length;
    const enabledAnalytics = allDocs.filter((p) => p.enabled && p.category === 'ANALYTICS').length;
    const enabledReports = allDocs.filter((p) => p.enabled && p.category === 'REPORTS').length;

    // User counts
    const normalUsers = await UserModel.find({ role: { $nin: ['admin', 'super_admin'] } });
    const totalNormalUsers = normalUsers.length;
    const totalPremiumUsers = normalUsers.filter((u) => u.premiumStatus === 'ACTIVE' || u.role === 'premium').length;
    const totalFreeUsers = totalNormalUsers - totalPremiumUsers;

    res.json({
      success: true,
      data: permissions,
      stats: {
        totalNormalUsers,
        totalPremiumUsers,
        totalFreeUsers,
        totalFeatures,
        totalEnabledFeatures: totalEnabled,
        totalDisabledFeatures: totalDisabled,
        enabledPremiumFeatures: enabledPremium,
        enabledBudgetFeatures: enabledBudget,
        enabledAnalyticsFeatures: enabledAnalytics,
        enabledReportFeatures: enabledReports,
      },
    });
  } catch (error: any) {
    console.error('[FeaturePermissions] Error fetching permissions:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve feature permissions', error: error.message });
  }
};

/**
 * GET /api/permissions
 * Public / authenticated endpoint returning the active feature map for the current user.
 */
export const getUserPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await seedDefaultFeaturePermissions();
    const permissions = await FeaturePermissionModel.find();

    const user = req.user;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isPremium = user?.premiumStatus === 'ACTIVE' || user?.role === 'premium' || isAdmin;

    const permissionsMap: Record<string, { enabled: boolean; freeUser: boolean; premiumUser: boolean; accessible: boolean }> = {};

    permissions.forEach((p) => {
      let accessible = false;
      if (p.enabled) {
        if (isAdmin) {
          accessible = true;
        } else if (isPremium) {
          accessible = p.premiumUser;
        } else {
          accessible = p.freeUser;
        }
      }

      permissionsMap[p.feature] = {
        enabled: p.enabled,
        freeUser: p.freeUser,
        premiumUser: p.premiumUser,
        accessible,
      };
    });

    res.json({
      success: true,
      isPremium,
      isAdmin,
      permissions: permissionsMap,
      rawList: permissions,
    });
  } catch (error: any) {
    console.error('[FeaturePermissions] Error fetching user permissions:', error);
    res.status(500).json({ success: false, message: 'Unable to load permissions' });
  }
};

/**
 * PATCH /api/admin/permissions/:feature
 * Updates a feature permission (enabled, freeUser, premiumUser) and records history audit.
 */
export const updateFeaturePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { feature } = req.params;
    const { enabled, freeUser, premiumUser } = req.body;

    const doc = await FeaturePermissionModel.findOne({ feature });
    if (!doc) {
      res.status(404).json({ success: false, message: `Feature '${feature}' not found` });
      return;
    }

    const previousEnabled = doc.enabled;
    const previousFreeUser = doc.freeUser;
    const previousPremiumUser = doc.premiumUser;

    let changeType: 'TOGGLE_ENABLED' | 'TOGGLE_FREE' | 'TOGGLE_PREMIUM' | 'BULK_UPDATE' = 'TOGGLE_ENABLED';
    let previousValueStr = '';
    let newValueStr = '';
    let actionDesc = '';

    if (enabled !== undefined && enabled !== doc.enabled) {
      changeType = 'TOGGLE_ENABLED';
      previousValueStr = previousEnabled ? 'Enabled' : 'Disabled';
      newValueStr = enabled ? 'Enabled' : 'Disabled';
      actionDesc = `${enabled ? 'Enabled' : 'Disabled'} feature '${doc.name}' (${doc.feature})`;
      doc.enabled = enabled;
    }

    if (freeUser !== undefined && freeUser !== doc.freeUser) {
      changeType = 'TOGGLE_FREE';
      previousValueStr = previousFreeUser ? 'Free User: ON' : 'Free User: OFF';
      newValueStr = freeUser ? 'Free User: ON' : 'Free User: OFF';
      actionDesc = `Changed Free User access for '${doc.name}' to ${freeUser ? 'ON' : 'OFF'}`;
      doc.freeUser = freeUser;
    }

    if (premiumUser !== undefined && premiumUser !== doc.premiumUser) {
      changeType = 'TOGGLE_PREMIUM';
      previousValueStr = previousPremiumUser ? 'Premium User: ON' : 'Premium User: OFF';
      newValueStr = premiumUser ? 'Premium User: ON' : 'Premium User: OFF';
      actionDesc = `Changed Premium User access for '${doc.name}' to ${premiumUser ? 'ON' : 'OFF'}`;
      doc.premiumUser = premiumUser;
    }

    doc.updatedBy = req.user?.email || 'admin';
    doc.updatedAt = new Date();
    await doc.save();

    // Log to Permission History
    await PermissionHistoryModel.create({
      adminId: req.user?.id || 'admin_1',
      adminEmail: req.user?.email || 'admin@budgetbuddy.app',
      adminName: req.user?.name || req.user?.fullName || 'Admin',
      feature: doc.feature,
      featureName: doc.name,
      category: doc.category,
      changeType,
      previousValue: previousValueStr,
      newValue: newValueStr,
      action: actionDesc || `Updated '${doc.name}' permission settings`,
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `✓ ${doc.name} permission updated successfully.`,
      data: doc,
    });
  } catch (error: any) {
    console.error('[FeaturePermissions] Error updating permission:', error);
    res.status(500).json({ success: false, message: 'Unable to update permission. Please try again.', error: error.message });
  }
};

/**
 * POST /api/admin/permissions/reset
 * Resets all feature permissions to default configuration with audit trail.
 */
export const resetFeaturePermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    for (const def of DEFAULT_FEATURE_PERMISSIONS) {
      await FeaturePermissionModel.findOneAndUpdate(
        { feature: def.feature },
        {
          name: def.name,
          description: def.description,
          category: def.category,
          freeUser: def.freeUser,
          premiumUser: def.premiumUser,
          enabled: def.enabled,
          isPremiumFeature: def.isPremiumFeature,
          updatedBy: req.user?.email || 'admin',
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    }

    // Record reset in history
    await PermissionHistoryModel.create({
      adminId: req.user?.id || 'admin_1',
      adminEmail: req.user?.email || 'admin@budgetbuddy.app',
      adminName: req.user?.name || req.user?.fullName || 'Admin',
      feature: 'ALL_FEATURES',
      featureName: 'All Platform Permissions',
      category: 'SYSTEM',
      changeType: 'RESET_DEFAULTS',
      previousValue: 'Custom configuration',
      newValue: 'Default configuration',
      action: 'Reset all feature permissions to platform defaults',
      ipAddress: req.ip || '',
    });

    const updatedList = await FeaturePermissionModel.find().sort({ category: 1, name: 1 });

    res.json({
      success: true,
      message: '✓ All feature permissions have been successfully reset to defaults.',
      data: updatedList,
    });
  } catch (error: any) {
    console.error('[FeaturePermissions] Error resetting permissions:', error);
    res.status(500).json({ success: false, message: 'Unable to reset permissions. Please try again.', error: error.message });
  }
};

/**
 * GET /api/admin/permissions/history
 * Returns the audit trail of permission changes with filtering and pagination.
 */
export const getPermissionHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, search, page = '1', limit = '30' } = req.query;
    const filter: any = {};

    if (category && category !== 'ALL') {
      filter.category = (category as string).toUpperCase();
    }
    if (search) {
      filter.$or = [
        { feature: { $regex: search, $options: 'i' } },
        { featureName: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const total = await PermissionHistoryModel.countDocuments(filter);
    const history = await PermissionHistoryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[FeaturePermissions] Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve permission history', error: error.message });
  }
};

/**
 * GET /api/admin/permissions/stats
 * Real-time metric card statistics for the Admin Feature Permission Dashboard.
 */
export const getPermissionDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await seedDefaultFeaturePermissions();
    const allDocs = await FeaturePermissionModel.find();

    const totalFeatures = allDocs.length;
    const totalEnabledFeatures = allDocs.filter((p) => p.enabled).length;
    const totalDisabledFeatures = allDocs.filter((p) => !p.enabled).length;

    const enabledPremiumFeatures = allDocs.filter((p) => p.enabled && p.category === 'PREMIUM').length;
    const enabledBudgetFeatures = allDocs.filter((p) => p.enabled && p.category === 'BUDGET').length;
    const enabledAnalyticsFeatures = allDocs.filter((p) => p.enabled && p.category === 'ANALYTICS').length;
    const enabledReportFeatures = allDocs.filter((p) => p.enabled && p.category === 'REPORTS').length;

    const normalUsers = await UserModel.find({ role: { $nin: ['admin', 'super_admin'] } });
    const totalNormalUsers = normalUsers.length;
    const totalPremiumUsers = normalUsers.filter((u) => u.premiumStatus === 'ACTIVE' || u.role === 'premium').length;
    const totalFreeUsers = totalNormalUsers - totalPremiumUsers;

    res.json({
      success: true,
      stats: {
        totalNormalUsers,
        totalPremiumUsers,
        totalFreeUsers,
        totalFeatures,
        totalEnabledFeatures,
        totalDisabledFeatures,
        enabledPremiumFeatures,
        enabledBudgetFeatures,
        enabledAnalyticsFeatures,
        enabledReportFeatures,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve stats', error: error.message });
  }
};
