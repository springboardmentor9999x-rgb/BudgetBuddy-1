import { Router } from 'express';
import {
  getBudgets,
  createOrUpdateBudget,
  updateBudgetById,
  deleteBudget,
} from '../controllers/budgetController';
import { authenticateUser } from '../middleware/authMiddleware';
import { requireFeaturePermission } from '../middleware/permissionMiddleware';

const router = Router();

router.get('/', authenticateUser, requireFeaturePermission('budget.view'), getBudgets);
router.post('/', authenticateUser, requireFeaturePermission('budget.create'), createOrUpdateBudget);
router.put('/:id', authenticateUser, requireFeaturePermission('budget.edit'), updateBudgetById);
router.delete('/:id', authenticateUser, requireFeaturePermission('budget.delete'), deleteBudget);

export default router;
