import { Router } from 'express';
import {
  login,
  register,
  verifyCode,
  sendVerificationCode,
  getCurrentUser,
} from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-code', verifyCode);
router.post('/send-verification', sendVerificationCode);
router.get('/me', authenticateUser, getCurrentUser);

export default router;
