import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController';

const router = express.Router();

router.use(authenticateToken);

// Get all notifications for user
router.get('/', getNotifications);

// Mark single notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/read/all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;
