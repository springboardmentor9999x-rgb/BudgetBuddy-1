import { create } from "zustand";

import {
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
} from "../services/account.api";

import type { BankAccount, CreateBankAccountFormData } from "../types/account.type";

interface AccountState {
  bankAccounts: BankAccount[];
  loading: boolean;

  fetchBankAccounts: () => Promise<void>;
  createBankAccount: (
    accountData: CreateBankAccountFormData
  ) => Promise<void>;
  removeBankAccount: (accountId: number) => Promise<void>;
}

const useAccountStore = create<AccountState>((set) => ({
  bankAccounts: [],
  loading: false,

  fetchBankAccounts: async () => {
    set({ loading: true });

    try {
      const accounts = await getBankAccounts();

      set({
        bankAccounts: accounts,
      });
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    } finally {
      set({ loading: false });
    }
  },

  createBankAccount: async (accountData) => {
    set({ loading: true });

    try {
      const newAccount = await addBankAccount(accountData);

      set((state) => ({
        bankAccounts: [...state.bankAccounts, newAccount],
      }));
    } catch (error) {
      console.error("Error creating bank account:", error);
      throw error; // Rethrow the error to be handled in the component
    } finally {
      set({ loading: false });
    }
  },

  removeBankAccount: async (accountId) => {
    set({ loading: true });

    try {
      await deleteBankAccount(accountId);

      set((state) => ({
        bankAccounts: state.bankAccounts.filter(
          (account) => account.id !== accountId
        ),
      }));
    } catch (error) {
      console.error("Error deleting bank account:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAccountStore;