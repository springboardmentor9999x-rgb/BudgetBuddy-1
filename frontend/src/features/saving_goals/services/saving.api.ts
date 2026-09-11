import { api } from '../../../api/api';
import type { SavingGoalCreate, SavingGoalUpdate } from '../types/saving.type';

// Backend prefix: /api/v1/savings  (see backend/app/api.py)
// Router paths  : /saving-goals, /saving-goals/{goal_id}

export async function getSavingGoalsApi() {
  const response = await api.get('/savings/saving-goals');
  return response.data;
}

export async function createSavingGoalApi(data: SavingGoalCreate) {
  const response = await api.post('/savings/saving-goals', data);
  return response.data;
}

export async function updateSavingGoalApi(goalId: number, data: SavingGoalUpdate) {
  const response = await api.put(`/savings/saving-goals/${goalId}`, data);
  return response.data;
}

export async function contributeToSavingGoalApi(goalId: number, data: { amount: number; account_id?: number }) {
  const response = await api.post(`/savings/saving-goals/${goalId}/contribute`, data);
  return response.data;
}

export async function deleteSavingGoalApi(goalId: number) {
  const response = await api.delete(`/savings/saving-goals/${goalId}`);
  return response.data;
}

