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

/** Deduct `amount` from account balance (on saving goal completion). */
async function deductFromAccount(accountId: number, amount: number) {
  try {
    const response = await api.patch(`/accounts/deduct/${accountId}`, { amount });
    return response.data;
  } catch (error) {
    console.error("Error deducting from account:", error);
    throw error;
  }
}

/** Request a password reset OTP for the currently authenticated user */
async function requestPasswordResetOtp() {
  try {
    const response = await api.post("/users/request-reset-otp");
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset OTP:", error);
    throw error;
  }
}

/** Change or reset password for authenticated user */
async function changePassword(payload: { current_password?: string; otp?: string; new_password: string }) {
  try {
    const response = await api.post("/users/change-password", payload);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

/** Request password reset OTP via unauthenticated auth route */
async function forgotPasswordRequest(email: string) {
  try {
    const response = await api.post("/auth/request-password-reset", { email });
    return response.data;
  } catch (error) {
    console.error("Error sending forgot password request:", error);
    throw error;
  }
}

/** Reset password via unauthenticated auth route */
async function forgotPasswordReset(payload: { email: string; otp: string; new_password: string }) {
  try {
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

export {
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  updateUserProfile,
  deleteUserAccount,
  deductFromAccount,
  requestPasswordResetOtp,
  changePassword,
  forgotPasswordRequest,
  forgotPasswordReset,
};