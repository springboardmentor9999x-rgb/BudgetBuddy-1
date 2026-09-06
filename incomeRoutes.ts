import { Router } from 'express';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateUser, getIncomes);
router.post('/', authenticateUser, createIncome);
router.get('/:id', authenticateUser, getIncomeById);
router.put('/:id', authenticateUser, updateIncome);
router.delete('/:id', authenticateUser, deleteIncome);

export default router;
