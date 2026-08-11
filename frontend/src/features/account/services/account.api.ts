import { api } from "../../../api/api.ts";
import type { CreateBankAccountFormData, UpdateUserProfile } from "../types/account.type.ts";

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

async function updateUserProfile(profileData: UpdateUserProfile) {
  try {
    const response = await api.put("/users/update-profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

async function deleteUserAccount() {
  try {
    const response = await api.delete("/users/delete-account");
    return response.data;
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
}

export { getBankAccounts, addBankAccount, deleteBankAccount, updateUserProfile, deleteUserAccount };