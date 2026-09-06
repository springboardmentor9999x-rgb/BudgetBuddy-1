import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateUser, getExpenses);
router.post('/', authenticateUser, createExpense);
router.get('/:id', authenticateUser, getExpenseById);
router.put('/:id', authenticateUser, updateExpense);
router.delete('/:id', authenticateUser, deleteExpense);

export default router;
