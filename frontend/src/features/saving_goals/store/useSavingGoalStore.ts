import { create } from 'zustand';
import type { SavingGoal, SavingGoalCreate, SavingGoalUpdate } from '../types/saving.type';
import {
  getSavingGoalsApi,
  createSavingGoalApi,
  updateSavingGoalApi,
  contributeToSavingGoalApi,
  deleteSavingGoalApi,
} from '../services/saving.api';

interface SavingGoalStore {
  goals: SavingGoal[];
  isLoading: boolean;

  fetchGoals: () => Promise<void>;
  addGoal: (data: SavingGoalCreate) => Promise<SavingGoal>;
  updateGoal: (id: number, data: SavingGoalUpdate) => Promise<SavingGoal>;
  contributeToGoal: (id: number, amount: number, accountId?: number) => Promise<SavingGoal>;
  deleteGoal: (id: number) => Promise<void>;

  // Local optimistic helpers
  setGoals: (goals: SavingGoal[]) => void;
}

const useSavingGoalStore = create<SavingGoalStore>((set) => ({
  goals: [],
  isLoading: false,

  setGoals: (goals) => set({ goals }),

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const data = await getSavingGoalsApi();
      set({ goals: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addGoal: async (data) => {
    const newGoal: SavingGoal = await createSavingGoalApi(data);
    set((state) => ({ goals: [...state.goals, newGoal] }));
    return newGoal;
  },

  updateGoal: async (id, data) => {
    const updated: SavingGoal = await updateSavingGoalApi(id, data);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
    return updated;
  },

  contributeToGoal: async (id, amount, accountId) => {
    const updated: SavingGoal = await contributeToSavingGoalApi(id, {
      amount,
      account_id: accountId,
    });
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
    return updated;
  },

  deleteGoal: async (id) => {
    await deleteSavingGoalApi(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));

export default useSavingGoalStore;

