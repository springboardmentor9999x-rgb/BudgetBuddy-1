import { Router } from 'express';
import {
  getDashboard,
  getDashboardSummary,
  getDashboardCharts,
  getDashboardAnalytics,
} from '../controllers/dashboardController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateUser, getDashboard);
router.get('/summary', authenticateUser, getDashboardSummary);
router.get('/charts', authenticateUser, getDashboardCharts);
router.get('/analytics', authenticateUser, getDashboardAnalytics);

export default router;
