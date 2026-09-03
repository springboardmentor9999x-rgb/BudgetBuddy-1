import { create } from 'zustand';
import toast from 'react-hot-toast';
import { reportApi } from '../services/report.api.ts';
import type { ReportDataResponse, ReportFilterState } from '../types/report.type.ts';

interface ReportStoreState {
  filters: ReportFilterState;
  reportData: ReportDataResponse | null;
  isLoading: boolean;
  isExportingExcel: boolean;
  isExportingPdf: boolean;
  isExportingCsv: boolean;
  error: string | null;

  setFilter: <K extends keyof ReportFilterState>(key: K, value: ReportFilterState[K]) => void;
  setFilters: (newFilters: Partial<ReportFilterState>) => void;
  applyPreset: (preset: 'this_month' | 'last_month' | 'this_year' | 'last_30_days' | 'last_90_days' | 'all_time') => void;
  fetchReportData: () => Promise<void>;
  exportExcel: (scope?: 'summary' | 'transactions') => Promise<void>;
  exportPdf: () => Promise<void>;
  exportTransactionsCsv: () => Promise<void>;
  exportTransactionsExcel: () => Promise<void>;
}

const now = new Date();

const initialFilters: ReportFilterState = {
  period_type: 'month',
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  start_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
  transaction_type: 'all',
  category: 'all',
  account: 'all',
  user_id: 'me',
};

export const useReportStore = create<ReportStoreState>((set, get) => ({
  filters: initialFilters,
  reportData: null,
  isLoading: false,
  isExportingExcel: false,
  isExportingPdf: false,
  isExportingCsv: false,
  error: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },

  applyPreset: (preset) => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;

    let updatedFilters: Partial<ReportFilterState> = {};

    switch (preset) {
      case 'this_month':
        updatedFilters = {
          period_type: 'month',
          month: curMonth,
          year: curYear,
        };
        break;

      case 'last_month': {
        const lastM = curMonth === 1 ? 12 : curMonth - 1;
        const lastY = curMonth === 1 ? curYear - 1 : curYear;
        updatedFilters = {
          period_type: 'month',
          month: lastM,
          year: lastY,
        };
        break;
      }

      case 'this_year':
        updatedFilters = {
          period_type: 'year',
          year: curYear,
        };
        break;

      case 'last_30_days': {
        const past30 = new Date(today);
        past30.setDate(past30.getDate() - 30);
        updatedFilters = {
          period_type: 'custom',
          start_date: past30.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0],
        };
        break;
      }

      case 'last_90_days': {
        const past90 = new Date(today);
        past90.setDate(past90.getDate() - 90);
        updatedFilters = {
          period_type: 'custom',
          start_date: past90.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0],
        };
        break;
      }

      case 'all_time':
        updatedFilters = {
          period_type: 'all',
        };
        break;
    }

    set((state) => ({
      filters: {
        ...state.filters,
        ...updatedFilters,
      },
    }));

    get().fetchReportData();
  },

  fetchReportData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reportApi.getReportData(get().filters);
      set({ reportData: data, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch report data:', err);
      const msg = err.response?.data?.detail || 'Failed to load report analytics';
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  exportExcel: async (scope = 'summary') => {
    set({ isExportingExcel: true });
    try {
      await reportApi.exportExcel(get().filters, scope);
      toast.success(
        scope === 'transactions'
          ? 'Transactions Excel file downloaded!'
          : 'Full Excel financial audit sheet downloaded!'
      );
    } catch (err: any) {
      console.error('Excel export error:', err);
      toast.error(err.response?.data?.detail || 'Failed to export Excel report.');
    } finally {
      set({ isExportingExcel: false });
    }
  },

  exportPdf: async () => {
    set({ isExportingPdf: true });
    try {
      await reportApi.exportPdf(get().filters);
      toast.success('Full PDF financial report downloaded!');
    } catch (err: any) {
      console.error('PDF export error:', err);
      toast.error(err.response?.data?.detail || 'Failed to export PDF report.');
    } finally {
      set({ isExportingPdf: false });
    }
  },

  exportTransactionsCsv: async () => {
    set({ isExportingCsv: true });
    try {
      await reportApi.exportCsv(get().filters);
      toast.success('Transactions CSV ledger downloaded!');
    } catch (err: any) {
      console.error('CSV export error:', err);
      toast.error(err.response?.data?.detail || 'Failed to export transactions CSV.');
    } finally {
      set({ isExportingCsv: false });
    }
  },

  exportTransactionsExcel: async () => {
    await get().exportExcel('transactions');
  },
}));
