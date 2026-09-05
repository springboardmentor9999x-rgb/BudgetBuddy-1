import api from "./api";

// Get all income
export const getIncomes = async () => {
  const response = await api.get("/income/");
  return response.data;
};

// Get total income summary
export const getIncomeSummary = async () => {
  const response = await api.get("/income/summary");
  return response.data;
};

// Create income
export const createIncome = async (incomeData) => {
  const response = await api.post("/income/", incomeData);
  return response.data;
};

// Update income
export const updateIncome = async (incomeId, incomeData) => {
  const response = await api.put(
    `/income/${incomeId}`,
    incomeData
  );

  return response.data;
};

// Delete income
export const deleteIncome = async (incomeId) => {
  const response = await api.delete(`/income/${incomeId}`);
  return response.data;
};
