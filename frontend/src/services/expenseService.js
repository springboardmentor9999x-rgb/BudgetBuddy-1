import api from "./api";

// Get all expenses
export const getExpenses = async () => {
  const response = await api.get("/expenses/");
  return response.data;
};

// Get category-wise expense summary
export const getExpenseSummary = async () => {
  const response = await api.get("/expenses/summary");
  return response.data;
};

// Create expense
export const createExpense = async (expenseData) => {
  const response = await api.post("/expenses/", expenseData);
  return response.data;
};

// Update expense
export const updateExpense = async (expenseId, expenseData) => {
  const response = await api.put(
    `/expenses/${expenseId}`,
    expenseData
  );

  return response.data;
};

// Delete expense
export const deleteExpense = async (expenseId) => {
  const response = await api.delete(`/expenses/${expenseId}`);
  return response.data;
};