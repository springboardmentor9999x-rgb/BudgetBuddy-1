import { api } from '../../../api/api.ts';
import type { ReportDataResponse, ReportFilterState } from '../types/report.type.ts';

const buildQueryParams = (filters: Partial<ReportFilterState>) => {
  const params: Record<string, string | number> = {
    period_type: filters.period_type || 'month',
    transaction_type: filters.transaction_type || 'all',
  };

  if (filters.period_type === 'month') {
    if (filters.month) params.month = filters.month;
    if (filters.year) params.year = filters.year;
  } else if (filters.period_type === 'year') {
    if (filters.year) params.year = filters.year;
  } else if (filters.period_type === 'custom') {
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
  }

  if (filters.category && filters.category !== 'all') {
    params.category = filters.category;
  }
  if (filters.account && filters.account !== 'all') {
    params.account = filters.account;
  }

  return params;
};

export const reportApi = {
  getReportData: async (filters: Partial<ReportFilterState>): Promise<ReportDataResponse> => {
    const params = buildQueryParams(filters);
    const response = await api.get<ReportDataResponse>('/reports/data', { params });
    return response.data;
  },

  exportExcel: async (filters: Partial<ReportFilterState>): Promise<void> => {
    const params = buildQueryParams(filters);
    const response = await api.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    });

    // Extract filename or fallback
    let filename = `BudgetBuddy_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  exportPdf: async (filters: Partial<ReportFilterState>): Promise<void> => {
    const params = buildQueryParams(filters);
    const response = await api.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
    });

    let filename = `BudgetBuddy_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
