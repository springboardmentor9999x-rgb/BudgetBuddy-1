import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware';
import {
  getUserTickets,
  createTicket,
  addMessageToTicket,
} from '../controllers/supportController';

const router = Router();

router.use(authenticateUser);

router.get('/tickets', getUserTickets);
router.post('/tickets', createTicket);
router.post('/tickets/:id/message', addMessageToTicket);

export default router;
