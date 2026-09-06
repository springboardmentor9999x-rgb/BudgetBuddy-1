import { Router } from 'express';
import { getReports } from '../controllers/reportController';
import { authenticateUser } from '../middleware/authMiddleware';
import { requireFeaturePermission } from '../middleware/permissionMiddleware';

const router = Router();

// GET /api/reports - Scoped to authenticated user
router.get('/', authenticateUser, requireFeaturePermission('reports.basic'), getReports);

export default router;
