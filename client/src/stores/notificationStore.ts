import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'https://job-finder-4cem.onrender.com/api';

export interface Notification {
    _id: string;
    type: 'job-match' | 'interview-scheduled' | 'profile-viewed' | 'application-update' | 'job-posted';
    title: string;
    description: string;
    read: boolean;
    jobId?: string | { _id: string } | null;
    createdAt: string;
    updatedAt: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return (error.response?.data as { error?: string } | undefined)?.error || fallback;
    }
    return fallback;
};

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchNotifications: (limit?: number, page?: number) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async (limit = 10, page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                params: { limit, page }
            });
            const { notifications, unreadCount } = response.data.data;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'Failed to fetch notifications');
            set({ error: errorMessage, isLoading: false });
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(
                    0,
                    state.notifications.some((n) => n._id === notificationId && !n.read)
                        ? state.unreadCount - 1
                        : state.unreadCount,
                )
            }));
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'Failed to mark notification as read');
            set({ error: errorMessage });
        }
    },

    markAllAsRead: async () => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/read/all`);
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, read: true })),
                unreadCount: 0
            }));
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'Failed to mark all as read');
            set({ error: errorMessage });
        }
    },

    deleteNotification: async (notificationId: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
            set(state => ({
                notifications: state.notifications.filter(n => n._id !== notificationId),
                unreadCount: Math.max(
                    0,
                    state.notifications.some((n) => n._id === notificationId && !n.read)
                        ? state.unreadCount - 1
                        : state.unreadCount,
                ),
            }));
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'Failed to delete notification');
            set({ error: errorMessage });
        }
    },

    addNotification: (notification: Notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    },

    clearError: () => set({ error: null })
}));
