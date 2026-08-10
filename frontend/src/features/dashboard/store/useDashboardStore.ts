/**
 * Zustand store for state management of dashboard statistics.
 * Handles fetching, loading states, error handling, and local state access.
 */
import { create } from 'zustand';
import { getDashboardStatsApi } from '../services/dashboard.api';
import type { DashboardStatsResponse } from '../types/dashboard.type';

interface DashboardStore {
  // State
  stats: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  resetStats: () => void;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  /**
   * Fetches dashboard statistics from backend API and updates store state.
   */
  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getDashboardStatsApi();
      set({ stats: data, isLoading: false });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to fetch dashboard statistics';
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
