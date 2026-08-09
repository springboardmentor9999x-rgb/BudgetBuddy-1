import { create } from "zustand";

import {
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "../services/expense.api.ts";

import type {
  ExpenseCreate,
  ExpenseUpdate,
} from "../types/expense.type.ts";


interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: string;
  account: string;
}


interface ExpenseStore {
  // State
  expenses: Expense[];

  // Local state mutations
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (updatedExpense: Expense) => void;
  deleteExpense: (expenseId: number) => void;

  // API operations
  fetchExpenses: () => Promise<void>;
  addNewExpense: (expense: ExpenseCreate) => Promise<void>;
  updateExistingExpense: (
    expenseId: number,
    updatedExpense: ExpenseUpdate
  ) => Promise<void>;
  deleteExistingExpense: (expenseId: number) => Promise<void>;
}


const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  // local state mutations
  setExpenses: (expenses) => {
    set({ expenses });
  },

  addExpense: (expense) => {
    set((state) => ({
      expenses: [...state.expenses, expense],
    }));
  },

  updateExpense: (updatedExpense) => {
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === updatedExpense.id
          ? updatedExpense
          : expense
      ),
    }));
  },

  deleteExpense: (expenseId) => {
    set((state) => ({
      expenses: state.expenses.filter(
        (expense) => expense.id !== expenseId
      ),
    }));
  },

  // -------------------------
  // API operations
  // -------------------------

  fetchExpenses: async () => {
    try {
      const data = await getExpensesApi();

      set({
        expenses: data,
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },


  addNewExpense: async (expense) => {
    try {
      const data = await createExpenseApi(expense);

      set((state) => ({
        expenses: [...state.expenses, data],
      }));
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },


  updateExistingExpense: async (expenseId, updatedExpense) => {
    try {
      const data = await updateExpenseApi(
        expenseId,
        updatedExpense
      );

      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === data.id
            ? data
            : expense
        ),
      }));
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },


  deleteExistingExpense: async (expenseId) => {
    try {
      await deleteExpenseApi(expenseId);

      set((state) => ({
        expenses: state.expenses.filter(
          (expense) => expense.id !== expenseId
        ),
      }));
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },
}));


export default useExpenseStore;
