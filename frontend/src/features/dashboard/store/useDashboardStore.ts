/**
 * Zustand store for state management of dashboard statistics.
 * Handles fetching, loading states, error handling, and local state access with period filtering.
 */
import { create } from 'zustand';
import { getDashboardStatsApi } from '../services/dashboard.api';
import type { DashboardStatsResponse } from '../types/dashboard.type';

interface DashboardStore {
  // State
  stats: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  selectedMonth: number | null; // 1-12 or null for all months
  selectedYear: number;

  // Actions
  setSelectedMonth: (month: number | null) => void;
  setSelectedYear: (year: number) => void;
  fetchDashboardStats: (month?: number | null, year?: number | null) => Promise<void>;
  resetStats: () => void;
}

const currentYear = new Date().getFullYear();

const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  isLoading: false,
  error: null,
  selectedMonth: null,
  selectedYear: currentYear,

  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
    get().fetchDashboardStats(month, get().selectedYear);
  },

  setSelectedYear: (year) => {
    set({ selectedYear: year });
    get().fetchDashboardStats(get().selectedMonth, year);
  },

  /**
   * Fetches dashboard statistics from backend API filtered by month and year.
   */
  fetchDashboardStats: async (month, year) => {
    const targetMonth = month !== undefined ? month : get().selectedMonth;
    const targetYear = year !== undefined ? year : get().selectedYear;

    set({ isLoading: true, error: null });
    try {
      const data = await getDashboardStatsApi(targetMonth, targetYear);
      set({ stats: data, isLoading: false });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to fetch dashboard statistics';
      set({ error: errorMessage, isLoading: false });
      console.error('Error in fetchDashboardStats:', err);
    }
  },

  /**
   * Resets dashboard store state to initial state.
   */
  resetStats: () => {
    set({ stats: null, isLoading: false, error: null });
  },
}));

export default useDashboardStore;

