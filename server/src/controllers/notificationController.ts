import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export async function getNotifications(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { limit = 10, page = 1 } = req.query;
        const skip = ((Number(page) || 1) - 1) * (Number(limit) || 10);

        const notifications = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(Number(limit) || 10)
            .skip(skip)
            .populate('jobId', 'title company');

        const total = await Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
        const unreadCount = await Notification.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            read: false,
        });

        return res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                    total,
                    pages: Math.ceil(total / (Number(limit) || 10)),
                },
                unreadCount,
            },
        });
    } catch (err: any) {
        logger.error('getNotifications', err);
        return res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
    }
}

export async function markAsRead(req: AuthRequest<{ notificationId: string }>, res: Response) {
    try {
        const userId = req.user?.userId;
        const { notificationId } = req.params;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
            { read: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        return res.json({ success: true, data: notification });
    } catch (err: any) {
        logger.error('markAsRead', err);
        return res.status(500).json({ error: err.message || 'Failed to mark notification as read' });
    }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await Notification.updateMany({ userId: new mongoose.Types.ObjectId(userId) }, { read: true });

        return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
        logger.error('markAllAsRead', err);
        return res.status(500).json({ error: err.message || 'Failed to mark notifications as read' });
    }
}

export async function deleteNotification(req: AuthRequest<{ notificationId: string }>, res: Response) {
    try {
        const userId = req.user?.userId;
        const { notificationId } = req.params;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await Notification.findOneAndDelete({
            _id: notificationId,
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!result) return res.status(404).json({ error: 'Notification not found' });
        return res.json({ success: true, message: 'Notification deleted' });
    } catch (err: any) {
        logger.error('deleteNotification', err);
        return res.status(500).json({ error: err.message || 'Failed to delete notification' });
    }
}

// Internal function to create notifications
export async function createNotificationForUsers(
    userIds: mongoose.Types.ObjectId[],
    type: 'job-match' | 'interview-scheduled' | 'profile-viewed' | 'application-update' | 'job-posted',
    title: string,
    description: string,
    jobId?: mongoose.Types.ObjectId
) {
    try {
        const notificationDocs = userIds.map(userId => ({
            userId,
            type,
            title,
            description,
            jobId,
            read: false,
        }));

        await Notification.insertMany(notificationDocs);
        logger.info(`Created ${notificationDocs.length} notifications for type: ${type}`);
    } catch (error) {
        logger.error('Failed to create notifications', error);
    }
}
