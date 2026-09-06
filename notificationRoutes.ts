import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getPreferences,
  updatePreferences,
  getBillReminders,
  createBillReminder,
  deleteBillReminder,
} from '../controllers/notificationController';

const router = Router();

// Notification REST Endpoints
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.patch('/notifications/:id/read', markAsRead);
router.patch('/notifications/read-all', markAllAsRead);
router.delete('/notifications/read', deleteAllReadNotifications);
router.delete('/notifications/:id', deleteNotification);

// Preference Endpoints
router.get('/notifications/preferences', getPreferences);
router.put('/notifications/preferences', updatePreferences);

// Bill Reminders Endpoints
router.get('/bill-reminders', getBillReminders);
router.post('/bill-reminders', createBillReminder);
router.delete('/bill-reminders/:id', deleteBillReminder);

export default router;
