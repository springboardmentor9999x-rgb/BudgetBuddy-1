import { api } from '../../../api/api';
import type { BudgetCreate, BudgetUpdate } from '../types/budget.type';

// Backend prefix: /api/v1/budgets  (see backend/app/api.py)
// Router paths  : /add-budget, /get-budgets, /get-budget/{id}, /update-budget/{id}, /delete-budget/{id}

export async function getBudgetsApi() {
  const response = await api.get('/budgets/get-budgets');
  return response.data;
}

export async function createBudgetApi(data: BudgetCreate) {
  const response = await api.post('/budgets/add-budget', data);
  return response.data;
}

export async function updateBudgetApi(budgetId: number, data: BudgetUpdate) {
  const response = await api.put(`/budgets/update-budget/${budgetId}`, data);
  return response.data;
}

export async function deleteBudgetApi(budgetId: number) {
  const response = await api.delete(`/budgets/delete-budget/${budgetId}`);
  return response.data;
}
