// import { useEffect } from "react";

import ExpenseStore from "../../../store/ExpenseStore";
import { getExpensesApi, createExpenseApi, updateExpenseApi, deleteExpenseApi } from "../services/expense.api";

import type { ExpenseCreate, ExpenseUpdate } from "../types/expense.type";

const useExpenseStore = () => {

  const expenses = ExpenseStore((state) => state.expenses);
  const setExpenses = ExpenseStore((state) => state.setExpenses);
  const addExpense = ExpenseStore((state) => state.addExpense);
  const updateExpense = ExpenseStore((state) => state.updateExpense);
  const deleteExpense = ExpenseStore((state) => state.deleteExpense);


  const fetchExpenses = async () => {
    try {
      const data = await getExpensesApi();
      console.log('Fetched expenses:', data); // Log the fetched data
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  }

  const addNewExpense = async (expense: ExpenseCreate) => {
    try {
      const data = await createExpenseApi(expense);
      addExpense(data);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  }

  const updateExistingExpense = async (expenseId: number, updatedExpense: ExpenseUpdate) => {
    try {
      const data = await updateExpenseApi(expenseId, updatedExpense);
      updateExpense(data);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  };

  const deleteExistingExpense = async (expenseId: number) => {
    try {
      await deleteExpenseApi(expenseId);
      deleteExpense(expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  };

  return {
    expenses,
    fetchExpenses,
    addNewExpense,
    updateExistingExpense,
    deleteExistingExpense,
  };
}

export default useExpenseStore;