import toast from "react-hot-toast";
import IncomeStore from "../../../store/IncomeStore.ts";
import { getIncomesApi, createIncomeApi, updateIncomeApi, deleteIncomeApi } from "../services/income.api.ts";

import type { IncomeCreate } from "../types/income.type.ts";
import { useEffect } from "react";

const useIncomeStore = () => {

  const incomes = IncomeStore((state) => state.incomes);
  const setIncomes = IncomeStore((state) => state.setIncomes);
  const addIncome = IncomeStore((state) => state.addIncome);
  const updateIncome = IncomeStore((state) => state.updateIncome);
  const deleteIncome = IncomeStore((state) => state.deleteIncome);


  const fetchIncomes = async () => {
    try {
      const response = await getIncomesApi();
      setIncomes(response);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      throw error;
    }
  }

  const createIncome = async (income: IncomeCreate) => {
    try {
      const response = await createIncomeApi(income);
      addIncome(response);
    } catch (error) {
      console.error("Error creating income:", error);
      throw error;
    }
  }

  const updateIncomeData = async (incomeId: number, income: IncomeCreate) => {
    try {
      const response = await updateIncomeApi(incomeId, income);
      updateIncome(response);
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  }

  const deleteIncomeData = async (incomeId: number) => {
    try {
      await deleteIncomeApi(incomeId);
      deleteIncome(incomeId);
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  }

  useEffect(() => {
    const getIncomes = async () => {
      try {
        await fetchIncomes();
      } catch (err) {
        console.error('Failed to fetch incomes:', err);
        toast.error('Failed to load incomes.');
      }
    };
    getIncomes();
  }, []);

  return { incomes, fetchIncomes, createIncome, updateIncomeData, deleteIncomeData };
}

export default useIncomeStore;