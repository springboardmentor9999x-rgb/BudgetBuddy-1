import { api } from '../../../api/api';

import type { ExpenseCreate, ExpenseUpdate, ExpenseFilterParams } from '../types/expense.type';

async function getExpensesApi(filters?: ExpenseFilterParams) {
  try {
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.category) params.category = filters.category;
      if (filters.account) params.account = filters.account;
      if (filters.min_amount !== undefined) params.min_amount = filters.min_amount;
      if (filters.max_amount !== undefined) params.max_amount = filters.max_amount;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.user_id) params.user_id = filters.user_id;
    }
    const response = await api.get('/expenses/get-expenses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

async function createExpenseApi(expenseData: ExpenseCreate) {
  try {
    const response = await api.post('/expenses/add-expense', expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

async function updateExpenseApi(expenseId: number, expenseData: ExpenseUpdate) {
  try {
    const response = await api.put(`/expenses/update-expense/${expenseId}`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

async function deleteExpenseApi(expenseId: number) {
  try {
    const response = await api.delete(`/expenses/delete-expense/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

export { getExpensesApi, createExpenseApi, updateExpenseApi, deleteExpenseApi };