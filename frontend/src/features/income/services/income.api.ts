import { api } from "../../../api/api.ts";
import type { IncomeCreate, IncomeUpdate, IncomeFilterParams } from "../types/income.type";

async function getIncomesApi(filters?: IncomeFilterParams) {
  try {
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.source) params.source = filters.source;
      if (filters.account) params.account = filters.account;
      if (filters.min_amount !== undefined) params.min_amount = filters.min_amount;
      if (filters.max_amount !== undefined) params.max_amount = filters.max_amount;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.user_id) params.user_id = filters.user_id;
    }
    const response = await api.get("/incomes/get-incomes", { params });
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