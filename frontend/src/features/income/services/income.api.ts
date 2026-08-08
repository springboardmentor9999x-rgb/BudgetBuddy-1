import { api } from "../../../api/api.ts";
import type { IncomeCreate, IncomeUpdate } from "../types/income.type";

async function getIncomesApi() {
  try {
    const response = await api.get("/incomes/get-incomes");
    return response.data;
  } catch (error) {
    console.error("Error fetching incomes:", error);
    throw error;
  }
}

async function createIncomeApi(incomeData: IncomeCreate) {
  try {
    const response = await api.post("/incomes/add-income", incomeData);
    return response.data;
  } catch (error) {
    console.error("Error creating income:", error);
    throw error;
  }
}

async function updateIncomeApi(incomeId: number, incomeData: IncomeUpdate) {
  try {
    const response = await api.put(
      `/incomes/update-income/${incomeId}`,
      incomeData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating income:", error);
    throw error;
  }
}

async function deleteIncomeApi(incomeId: number) {
  try {
    const response = await api.delete(`/incomes/delete-income/${incomeId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting income:", error);
    throw error;
  }
}

export {
  getIncomesApi,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
};