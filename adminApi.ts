import { apiClient } from './api';
import { SupportTicketDoc } from '../types/support';
import {
  AdminDashboardStats,
  AdminUserDoc,
  AdminSubscriptionDoc,
  AdminPlanDoc,
  AdminCategoryDoc,
  AdminAuditLogDoc,
  AdminSystemSettingsDoc,
  AdminFinanceOverviewDoc,
  AdminReportDoc,
  SecurityEventDoc,
  AdminSessionDoc,
  AdminNotificationDoc,
  AdminAlertDoc,
} from '../types/admin';

export const adminApi = {
  // 1. Dashboard Overview
  async getDashboardStats(): Promise<{ stats: AdminDashboardStats; charts: any; recentActivities: any[] }> {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  // 2. User Management
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    verified?: string;
    tier?: string;
    premiumStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminUserDoc[]; pagination: any }> {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },

  async getUserById(id: string): Promise<{ success: boolean; user: AdminUserDoc }> {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },

  async updateUserStatus(id: string, accountStatus: 'active' | 'suspended' | 'pending') {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { accountStatus });
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },

  async forceLogoutUser(id: string) {
    const res = await apiClient.post(`/admin/users/${id}/force-logout`);
    return res.data;
  },

  async updateUserRole(id: string, role: string) {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async grantUserPremium(id: string, data: { action: 'grant' | 'revoke' | 'activate'; durationDays?: number; planCode?: string }) {
    const res = await apiClient.post(`/admin/users/${id}/grant-premium`, data);
    return res.data;
  },

  // 3. Premium Users & Subscriptions
  async getPremiumDashboard() {
    const res = await apiClient.get('/admin/premium/dashboard');
    return res.data.data;
  },

  async getPremiumUsers(params?: { search?: string; status?: string; plan?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/admin/premium-users', { params });
    return res.data;
  },

  async getSubscriptions(params?: { status?: string; plan?: string; provider?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/admin/subscriptions', { params });
    return res.data;
  },

  async updateSubscription(id: string, data: { status?: string; extendDays?: number; notes?: string }) {
    const res = await apiClient.patch(`/admin/subscriptions/${id}`, data);
    return res.data;
  },

  // 4. Plan Management
  async getPlans(): Promise<AdminPlanDoc[]> {
    const res = await apiClient.get('/admin/plans');
    return res.data.data || [];
  },

  async createPlan(data: Partial<AdminPlanDoc>) {
    const res = await apiClient.post('/admin/plans', data);
    return res.data;
  },

  async updatePlan(id: string, data: Partial<AdminPlanDoc>) {
    const res = await apiClient.patch(`/admin/plans/${id}`, data);
    return res.data;
  },

  async deletePlan(id: string) {
    const res = await apiClient.delete(`/admin/plans/${id}`);
    return res.data;
  },

  // 5. Analytics
  async getAnalytics() {
    const res = await apiClient.get('/admin/analytics');
    return res.data.data;
  },

  // 6. Finance Overview (Aggregated)
  async getFinanceOverview(): Promise<AdminFinanceOverviewDoc> {
    const res = await apiClient.get('/admin/finance-overview');
    return res.data.data;
  },

  // 7. Reports Management
  async getReports(): Promise<{
    stats: {
      totalReports: number;
      generatedReports: number;
      pendingReports: number;
      failedReports: number;
      reportsGeneratedToday: number;
      reportsGeneratedThisMonth: number;
    };
    reports: AdminReportDoc[];
  }> {
    const res = await apiClient.get('/admin/reports');
    return res.data;
  },

  async generateReport(data: { title?: string; reportType: string; format?: string }) {
    const res = await apiClient.post('/admin/reports/generate', data);
    return res.data;
  },

  async deleteReport(id: string) {
    const res = await apiClient.delete(`/admin/reports/${id}`);
    return res.data;
  },

  // 8. Notifications Management
  async getNotifications(): Promise<AdminNotificationDoc[]> {
    const res = await apiClient.get('/admin/notifications');
    return res.data.data || [];
  },

  async createNotification(data: {
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    targetAudience?: 'all' | 'free' | 'premium' | 'admin';
    type?: string;
    scheduleDate?: string;
    scheduleTime?: string;
  }) {
    const res = await apiClient.post('/admin/notifications', data);
    return res.data;
  },

  async updateNotification(id: string, data: Partial<AdminNotificationDoc>) {
    const res = await apiClient.patch(`/admin/notifications/${id}`, data);
    return res.data;
  },

  async deleteNotification(id: string) {
    const res = await apiClient.delete(`/admin/notifications/${id}`);
    return res.data;
  },

  // 9. Security Management
  async getSecurityDashboard(): Promise<{
    stats: {
      recentAdminLogins: number;
      failedLoginAttempts: number;
      otpVerificationFailures: number;
      suspiciousLoginActivity: number;
      activeSessions: number;
    };
    securityEvents: SecurityEventDoc[];
    activeSessions: AdminSessionDoc[];
  }> {
    const res = await apiClient.get('/admin/security');
    return res.data;
  },

  async getSessions(): Promise<AdminSessionDoc[]> {
    const res = await apiClient.get('/admin/security/sessions');
    return res.data.data || [];
  },

  async revokeSession(id: string) {
    const res = await apiClient.post(`/admin/security/sessions/${id}/revoke`);
    return res.data;
  },

  async forceLogoutAllSessions() {
    const res = await apiClient.post('/admin/security/force-logout-all');
    return res.data;
  },

  // 10. Audit Logs
  async getAuditLogs(params?: {
    action?: string;
    targetType?: string;
    result?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminAuditLogDoc[]; pagination: any }> {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data;
  },

  // 11. System Settings
  async getSystemSettings(): Promise<AdminSystemSettingsDoc> {
    const res = await apiClient.get('/admin/settings');
    return res.data.data;
  },

  async updateSystemSettings(data: Partial<AdminSystemSettingsDoc>) {
    const res = await apiClient.patch('/admin/settings', data);
    return res.data;
  },

  // 12. Admin Profile
  async getAdminProfile(): Promise<AdminUserDoc> {
    const res = await apiClient.get('/admin/profile');
    return res.data.data;
  },

  async updateAdminProfile(data: { name?: string; fullName?: string; email?: string }) {
    const res = await apiClient.patch('/admin/profile', data);
    return res.data;
  },

  async changePassword(data: { currentPassword?: string; newPassword: string }) {
    const res = await apiClient.post('/admin/profile/password', data);
    return res.data;
  },

  async toggle2FA(enabled: boolean) {
    const res = await apiClient.post('/admin/profile/2fa', { enabled });
    return res.data;
  },

  // 13. Admin Notification Center Alerts
  async getAdminAlerts(): Promise<AdminAlertDoc[]> {
    const res = await apiClient.get('/admin/alerts');
    return res.data.alerts || [];
  },

  // 14. Categories, Budgets, Transactions & System Health
  async getCategories(): Promise<AdminCategoryDoc[]> {
    const res = await apiClient.get('/admin/categories');
    return res.data.data || [];
  },

  async createCategory(data: Partial<AdminCategoryDoc>) {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },

  async updateCategory(id: string, data: Partial<AdminCategoryDoc>) {
    const res = await apiClient.patch(`/admin/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data;
  },

  async getBudgets() {
    const res = await apiClient.get('/admin/budgets');
    return res.data.data;
  },

  async getTransactions() {
    const res = await apiClient.get('/admin/transactions');
    return res.data.data;
  },

  async getSystemHealth() {
    const res = await apiClient.get('/admin/system-health');
    return res.data.data;
  },

  // 15. Support Tickets
  async getSupportTickets(params?: { priority?: string; status?: string; search?: string; page?: number; limit?: number }): Promise<{ success: boolean; data: SupportTicketDoc[]; pagination: any }> {
    const res = await apiClient.get('/admin/support', { params });
    return res.data;
  },

  async replySupportTicket(id: string, message: string, status?: string): Promise<{ success: boolean; message: string; data: SupportTicketDoc }> {
    const res = await apiClient.post(`/admin/support/${id}/reply`, { message, status });
    return res.data;
  },

  async updateTicketStatus(id: string, status: string, priority?: string): Promise<{ success: boolean; data: SupportTicketDoc }> {
    const res = await apiClient.patch(`/admin/support/${id}/status`, { status, priority });
    return res.data;
  },
};
