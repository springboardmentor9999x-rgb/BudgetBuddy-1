import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'overspend' | 'goal_complete' | 'goal_near' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  dedupKey?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (n) => {
        const list = get().notifications;

        // 1. If dedupKey is provided, check for existing notification with same dedupKey
        if (n.dedupKey) {
          const existingIndex = list.findIndex((item) => item.dedupKey === n.dedupKey);
          if (existingIndex !== -1) {
            const existing = list[existingIndex];
            // If message hasn't changed and it's less than 24 hours old, do not spam
            if (existing.message === n.message) {
              return;
            }
            // If message changed (e.g. updated spent amount), update it in place without duplicating
            const updatedList = [...list];
            updatedList[existingIndex] = {
              ...existing,
              title: n.title,
              message: n.message,
              timestamp: new Date().toISOString(),
              read: false,
            };
            set({ notifications: updatedList });
            return;
          }
        }

        // 2. Default deduplication: prevent same title within 30 minutes
        const recent = list.find(
          (existing) =>
            existing.title === n.title &&
            Date.now() - new Date(existing.timestamp).getTime() < 30 * 60 * 1000
        );
        if (recent) return;

        const newNotif: AppNotification = {
          ...n,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50), // cap at 50
        }));
      },

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'budgetbuddy-notifications' }
  )
);

