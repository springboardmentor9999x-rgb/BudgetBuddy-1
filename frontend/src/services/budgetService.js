import api from "./api";

// Get all budgets
export const getBudgets = async () => {
  const response = await api.get("/budgets/");
  return response.data;
};

// Create budget
export const createBudget = async (budgetData) => {
  const response = await api.post("/budgets/", budgetData);
  return response.data;
};

// Update budget
export const updateBudget = async (budgetId, budgetData) => {
  const response = await api.put(
    `/budgets/${budgetId}`,
    budgetData
  );

  return response.data;
};

// Delete budget
export const deleteBudget = async (budgetId) => {
  const response = await api.delete(`/budgets/${budgetId}`);
  return response.data;
};
