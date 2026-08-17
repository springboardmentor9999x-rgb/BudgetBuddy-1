import { create } from 'zustand';
import type { Budget, BudgetCreate, BudgetUpdate } from '../types/budget.type';
import {
  getBudgetsApi,
  createBudgetApi,
  updateBudgetApi,
  deleteBudgetApi,
} from '../services/budget.api';

interface BudgetStore {
  budgets: Budget[];
  isLoading: boolean;

  fetchBudgets: () => Promise<void>;
  addBudget: (data: BudgetCreate) => Promise<Budget>;
  updateBudget: (id: number, data: BudgetUpdate) => Promise<Budget>;
  deleteBudget: (id: number) => Promise<void>;

  setBudgets: (budgets: Budget[]) => void;
}

const useBudgetStore = create<BudgetStore>((set) => ({
  budgets: [],
  isLoading: false,

  setBudgets: (budgets) => set({ budgets }),

  fetchBudgets: async () => {
    set({ isLoading: true });
    try {
      const data = await getBudgetsApi();
      set({ budgets: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addBudget: async (data) => {
    const newBudget: Budget = await createBudgetApi(data);
    set((state) => ({ budgets: [...state.budgets, newBudget] }));
    return newBudget;
  },

  updateBudget: async (id, data) => {
    const updated: Budget = await updateBudgetApi(id, data);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? updated : b)),
    }));
    return updated;
  },

  deleteBudget: async (id) => {
    await deleteBudgetApi(id);
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
  },
}));

export default useBudgetStore;
