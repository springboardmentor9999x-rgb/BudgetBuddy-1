/**
 * API service calls for fetching dashboard data from the backend.
 */
import { api } from '../../../api/api.ts';
import type { DashboardStatsResponse } from '../types/dashboard.type';

/**
 * Fetches aggregated user dashboard stats from the backend API, optionally filtered by month and year.
 * Endpoint: GET /api/v1/dashboard/stats?month=X&year=Y
 *
 * @param {number} [month] Optional month (1-12)
 * @param {number} [year] Optional year (e.g. 2026)
 * @returns {Promise<DashboardStatsResponse>} Aggregated dashboard data including stats, charts, and recent transactions.
 */
export async function getDashboardStatsApi(month?: number | null, year?: number | null): Promise<DashboardStatsResponse> {
  try {
    const params: Record<string, number> = {};
    if (month !== null && month !== undefined && month >= 1 && month <= 12) {
      params.month = month;
    }
    if (year !== null && year !== undefined && year > 0) {
      params.year = year;
    }

    const response = await api.get<DashboardStatsResponse>('/dashboard/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

