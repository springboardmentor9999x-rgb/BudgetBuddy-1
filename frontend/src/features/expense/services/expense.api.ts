// import axios from 'axios';
import { api } from '../../../api/api';

import type { ExpenseCreate, ExpenseUpdate } from '../types/expense.type';

async function getExpensesApi() {
  try {
    const response = await api.get('/expenses/get-expenses');
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