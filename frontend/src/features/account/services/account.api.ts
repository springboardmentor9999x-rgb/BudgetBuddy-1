import { api } from "../../../api/api.ts";
import type { CreateBankAccountFormData } from "../types/account.type.ts";

async function getBankAccounts() {
  try {
    const response = await api.get("/accounts/get-all-accounts");
    return response.data;
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    throw error;
  }
}

async function addBankAccount(accountData: CreateBankAccountFormData) {
  try {
    const response = await api.post("/accounts/add-bank-account", accountData);
    return response.data;
  } catch (error) {
    console.error("Error adding bank account:", error);
    throw error;
  }
}

async function deleteBankAccount(accountId: number) {
  try {
    const response = await api.delete(`/accounts/delete-account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting bank account:", error);
    throw error;
  }
}

export { getBankAccounts, addBankAccount, deleteBankAccount };