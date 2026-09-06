import { Router } from 'express';
import {
  authenticateUser,
  requireAdmin,
  requireSuperAdmin,
} from '../middleware/authMiddleware';
import {
  getAdminDashboard,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  forceLogoutUser,
  updateUserRole,
  grantUserPremium,
  getPremiumDashboard,
  getPremiumUsers,
  getSubscriptions,
  updateSubscription,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAdminAnalytics,
  getFinanceOverview,
  getAdminReports,
  generateAdminReport,
  deleteAdminReport,
  getAdminNotifications,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
  getSecurityDashboard,
  getAdminSessions,
  revokeAdminSession,
  forceLogoutAllSessions,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  toggleAdmin2FA,
  getAdminAlerts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSupportTickets,
  replySupportTicket,
  updateTicketStatus,
  getAdminBudgets,
  getAdminTransactions,
  getAdminSystemHealth,
} from '../controllers/adminController';

const router = Router();

// Protect ALL admin routes with authenticateUser + requireAdmin
router.use(authenticateUser, requireAdmin);

// 1. Dashboard
router.get('/dashboard', getAdminDashboard);

// 2. User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/force-logout', forceLogoutUser);
router.patch('/users/:id/role', updateUserRole);
router.post('/users/:id/grant-premium', grantUserPremium);

// 3. Premium Management
router.get('/premium/dashboard', getPremiumDashboard);
router.get('/premium-users', getPremiumUsers);
router.get('/subscriptions', getSubscriptions);
router.patch('/subscriptions/:id', updateSubscription);
router.get('/plans', getPlans);
router.post('/plans', requireSuperAdmin, createPlan);
router.patch('/plans/:id', requireSuperAdmin, updatePlan);
router.delete('/plans/:id', requireSuperAdmin, deletePlan);

// 4. Analytics
router.get('/analytics', getAdminAnalytics);

// 5. Finance Overview (Aggregated)
router.get('/finance-overview', getFinanceOverview);

// 6. Reports Management
router.get('/reports', getAdminReports);
router.post('/reports/generate', generateAdminReport);
router.delete('/reports/:id', deleteAdminReport);

// 7. Notifications Management
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createAdminNotification);
router.patch('/notifications/:id', updateAdminNotification);
router.delete('/notifications/:id', deleteAdminNotification);

// 8. Security Management
router.get('/security', getSecurityDashboard);
router.get('/security/sessions', getAdminSessions);
router.post('/security/sessions/:id/revoke', revokeAdminSession);
router.post('/security/force-logout-all', forceLogoutAllSessions);

// 9. Audit Logs
router.get('/audit-logs', getAuditLogs);

// 10. System Settings
router.get('/settings', getSystemSettings);
router.patch('/settings', requireSuperAdmin, updateSystemSettings);

// 11. Admin Profile
router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);
router.post('/profile/password', changeAdminPassword);
router.post('/profile/2fa', toggleAdmin2FA);

// 12. Admin Notification Center Alerts
router.get('/alerts', getAdminAlerts);

// 13. Categories, Support, Diagnostics, Budgets & Transactions
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/support', getSupportTickets);
router.post('/support/:id/reply', replySupportTicket);
router.patch('/support/:id/status', updateTicketStatus);

router.get('/budgets', getAdminBudgets);
router.get('/transactions', getAdminTransactions);
router.get('/system-health', getAdminSystemHealth);

// 14. Feature Permissions Management
import {
  getAllPermissions,
  getPermissionDashboardStats,
  updateFeaturePermission,
  resetFeaturePermissions,
  getPermissionHistory,
} from '../controllers/featurePermissionController';

router.get('/permissions', getAllPermissions);
router.get('/permissions/stats', getPermissionDashboardStats);
router.patch('/permissions/:feature', updateFeaturePermission);
router.post('/permissions/reset', resetFeaturePermissions);
router.get('/permissions/history', getPermissionHistory);

export default router;
