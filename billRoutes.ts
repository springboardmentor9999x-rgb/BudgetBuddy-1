import { Router } from 'express';
import {
  getBills,
  createBill,
  updateBill,
  markBillPaid,
  deleteBill,
} from '../controllers/billController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateUser, getBills);
router.post('/', authenticateUser, createBill);
router.put('/:id', authenticateUser, updateBill);
router.post('/:id/pay', authenticateUser, markBillPaid);
router.patch('/:id/pay', authenticateUser, markBillPaid);
router.delete('/:id', authenticateUser, deleteBill);

export default router;
