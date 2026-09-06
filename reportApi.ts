import { apiClient } from './api';
import { ReportResponse, ReportPeriod } from '../types/reportTypes';

export interface ReportApiParams {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  monthYear?: string;
}

export const reportApi = {
  async getReports(params?: ReportApiParams): Promise<ReportResponse> {
    const res = await apiClient.get('/reports', { params });
    return res.data;
  },
};
