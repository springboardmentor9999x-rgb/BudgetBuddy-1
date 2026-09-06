import { NotificationDoc, NotificationPreferenceDoc, BillReminderItem } from '../types/notification';

const API_BASE = 'http://localhost:5000/api';

export const notificationApi = {
  // Fetch Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{
    notifications: NotificationDoc[];
    pagination: { total: number; page: number; limit: number; totalPages: number; hasMore: boolean };
    unreadCount: number;
  }> {
    try {
      const url = new URL(`${API_BASE}/notifications`);
      if (params?.page) url.searchParams.append('page', params.page.toString());
      if (params?.limit) url.searchParams.append('limit', params.limit.toString());
      if (params?.status) url.searchParams.append('status', params.status);
      if (params?.category) url.searchParams.append('category', params.category);
      if (params?.search) url.searchParams.append('search', params.search);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return {
        notifications: data.notifications,
        pagination: data.pagination,
        unreadCount: data.unreadCount,
      };
    } catch (err) {
      console.warn('[NotificationAPI] Express server offline or unreachable, using local fallback handler.');
      throw err;
    }
  },

  // Get Unread Count
  async getUnreadCount(): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`);
      const data = await res.json();
      return data.count;
    } catch {
      return 0;
    }
  },

  // Mark single as read
  async markAsRead(id: string): Promise<NotificationDoc | null> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
      });
      const data = await res.json();
      return data.notification;
    } catch {
      return null;
    }
  },

  // Mark all as read
  async markAllAsRead(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  // Delete single notification
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  // Delete all read notifications
  async deleteAllRead(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/read`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  // Get preferences
  async getPreferences(): Promise<NotificationPreferenceDoc | null> {
    try {
      const res = await fetch(`${API_BASE}/notifications/preferences`);
      const data = await res.json();
      return data.preferences;
    } catch {
      return null;
    }
  },

  // Update preferences
  async updatePreferences(updates: Partial<NotificationPreferenceDoc>): Promise<NotificationPreferenceDoc | null> {
    try {
      const res = await fetch(`${API_BASE}/notifications/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      return data.preferences;
    } catch {
      return null;
    }
  },

  // Bill Reminders
  async getBillReminders(): Promise<BillReminderItem[]> {
    try {
      const res = await fetch(`${API_BASE}/bill-reminders`);
      const data = await res.json();
      return data.reminders || [];
    } catch {
      return [];
    }
  },

  async createBillReminder(billData: Omit<BillReminderItem, 'id' | 'userId' | 'createdAt'>): Promise<BillReminderItem | null> {
    try {
      const res = await fetch(`${API_BASE}/bill-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
      const data = await res.json();
      return data.reminder;
    } catch {
      return null;
    }
  },

  async deleteBillReminder(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/bill-reminders/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },
};
