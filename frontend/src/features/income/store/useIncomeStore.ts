import { create } from "zustand";

import {
  getIncomesApi,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
} from "../services/income.api.ts";

import type { IncomeCreate, Income, IncomeFilterParams } from "../types/income.type.ts";

interface IncomeStore {
  // State
  incomes: Income[];

  // API operations
  fetchIncomes: (filters?: IncomeFilterParams) => Promise<void>;
  createIncome: (income: IncomeCreate) => Promise<void>;
  updateIncomeData: (
    incomeId: number,
    income: IncomeCreate
  ) => Promise<void>;
  deleteIncomeData: (incomeId: number) => Promise<void>;
}

const useIncomeStore = create<IncomeStore>((set) => ({
  // State
  incomes: [],

  // API operations
  fetchIncomes: async (filters) => {
    try {
      const response = await getIncomesApi(filters);

      set({
        incomes: response,
      });
    } catch (error) {
      console.error("Error fetching incomes:", error);
      throw error;
    }
  },


  createIncome: async (income) => {
    try {
      const response = await createIncomeApi(income);

      set((state) => ({
        incomes: [...state.incomes, response],
      }));
    } catch (error) {
      console.error("Error creating income:", error);
      throw error;
    }
  },


  updateIncomeData: async (incomeId, income) => {
    try {
      const response = await updateIncomeApi(
        incomeId,
        income
      );

      set((state) => ({
        incomes: state.incomes.map((existingIncome) =>
          existingIncome.id === response.id
            ? response
            : existingIncome
        ),
      }));
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  },


  deleteIncomeData: async (incomeId) => {
    try {
      await deleteIncomeApi(incomeId);

      set((state) => ({
        incomes: state.incomes.filter(
          (income) => income.id !== incomeId
        ),
      }));
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  },
}));


export default useIncomeStore;

