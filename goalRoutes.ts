import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  depositToGoal,
  deleteGoal,
} from '../controllers/goalController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateUser, getGoals);
router.post('/', authenticateUser, createGoal);
router.put('/:id', authenticateUser, updateGoal);
router.post('/:id/deposit', authenticateUser, depositToGoal);
router.delete('/:id', authenticateUser, deleteGoal);

export default router;
