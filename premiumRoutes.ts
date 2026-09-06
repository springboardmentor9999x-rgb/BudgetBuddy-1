import { Router } from 'express';
import {
  authenticateUser,
  requirePremium,
} from '../middleware/authMiddleware';
import {
  getActivePlans,
  subscribe,
  cancelSubscription,
  getSubscriptionStatus,
  getPremiumAnalytics,
  getFinancialHealthScore,
  getFinancialInsights,
  getFinancialForecasts,
  getScheduledReports,
  createScheduledReport,
  deleteScheduledReport,
  getCustomCategories,
  createCustomCategory,
} from '../controllers/premiumController';

const router = Router();

// Public / Authenticated plans query
router.get('/plans', getActivePlans);

// Authenticated user subscription operations
router.use(authenticateUser);

router.post('/subscribe', subscribe);
router.post('/cancel', cancelSubscription);
router.get('/subscription', getSubscriptionStatus);

// Premium Feature APIs (Server-side RBAC protection)
router.get('/analytics', requirePremium, getPremiumAnalytics);
router.get('/health-score', requirePremium, getFinancialHealthScore);
router.get('/insights', requirePremium, getFinancialInsights);
router.get('/forecasts', requirePremium, getFinancialForecasts);

// Scheduled Reports
router.get('/reports/scheduled', requirePremium, getScheduledReports);
router.post('/reports/scheduled', requirePremium, createScheduledReport);
router.delete('/reports/scheduled/:id', requirePremium, deleteScheduledReport);

// Custom Categories
router.get('/categories', requirePremium, getCustomCategories);
router.post('/categories', requirePremium, createCustomCategory);

export default router;
