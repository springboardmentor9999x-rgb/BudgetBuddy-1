/**
 * API service calls for fetching dashboard data from the backend.
 */
import { api } from '../../../api/api.ts';
import type { DashboardStatsResponse } from '../types/dashboard.type';

/**
 * Fetches aggregated user dashboard stats from the backend API.
 * Endpoint: GET /api/v1/dashboard/stats
 *
 * @returns {Promise<DashboardStatsResponse>} Aggregated dashboard data including stats, charts, and recent transactions.
 */
export async function getDashboardStatsApi(): Promise<DashboardStatsResponse> {
  try {
    const response = await api.get<DashboardStatsResponse>('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}
