import { Router } from 'express';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware';
import {
  getAllPermissions,
  getUserPermissions,
  updateFeaturePermission,
  resetFeaturePermissions,
  getPermissionHistory,
  getPermissionDashboardStats,
} from '../controllers/featurePermissionController';

const router = Router();

// Public / Authenticated user endpoint for client feature gating
router.get('/', authenticateUser, getUserPermissions);

// Admin Central Feature Permission Control Endpoints (Strictly Protected)
router.get('/admin', authenticateUser, requireAdmin, getAllPermissions);
router.get('/admin/stats', authenticateUser, requireAdmin, getPermissionDashboardStats);
router.patch('/admin/:feature', authenticateUser, requireAdmin, updateFeaturePermission);
router.post('/admin/reset', authenticateUser, requireAdmin, resetFeaturePermissions);
router.get('/admin/history', authenticateUser, requireAdmin, getPermissionHistory);

export default router;
