import { apiClient } from './api';
import {
  FeaturePermissionDoc,
  PermissionHistoryDoc,
  PermissionDashboardStats,
  UserPermissionsResponse,
} from '../types/permission';

export const permissionApi = {
  /**
   * Fetch all permissions and aggregated stats for Admin Console
   */
  async getAllPermissions(params?: {
    category?: string;
    search?: string;
    enabled?: string;
  }): Promise<{
    success: boolean;
    data: FeaturePermissionDoc[];
    stats: PermissionDashboardStats;
  }> {
    const res = await apiClient.get('/admin/permissions', { params });
    return res.data;
  },

  /**
   * Fetch real-time dashboard card metrics
   */
  async getDashboardStats(): Promise<{ success: boolean; stats: PermissionDashboardStats }> {
    const res = await apiClient.get('/admin/permissions/stats');
    return res.data;
  },

  /**
   * Update a specific feature permission toggle
   */
  async updatePermission(
    feature: string,
    data: { enabled?: boolean; freeUser?: boolean; premiumUser?: boolean }
  ): Promise<{ success: boolean; message: string; data: FeaturePermissionDoc }> {
    const res = await apiClient.patch(`/admin/permissions/${feature}`, data);
    return res.data;
  },

  /**
   * Reset all feature permissions to default configuration
   */
  async resetPermissions(): Promise<{
    success: boolean;
    message: string;
    data: FeaturePermissionDoc[];
  }> {
    const res = await apiClient.post('/admin/permissions/reset');
    return res.data;
  },

  /**
   * Fetch audit history trail
   */
  async getPermissionHistory(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: PermissionHistoryDoc[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const res = await apiClient.get('/admin/permissions/history', { params });
    return res.data;
  },

  /**
   * Fetch active permissions for currently logged-in user
   */
  async getUserPermissions(): Promise<UserPermissionsResponse> {
    const res = await apiClient.get('/permissions');
    return res.data;
  },
};
