type UserProfile = {
  full_name: string;
  monthly_income: number | string;
  currency: string;
};

type User = {
  id?: string | number;
  email: string;
  role: string;
  profile?: UserProfile | null;
};

type UpdateUserProfile = {
  full_name?: string;
  monthly_income?: number;
};

interface CreateBankAccountFormData {
  account_number: string;
  bank_name: string;
  balance: number;
}

interface BankAccount extends CreateBankAccountFormData {
  id: number;
}

interface BankAccountData {
  account_number: string;
  bank_name: string;
  balance: number;
}

export type { CreateBankAccountFormData, BankAccount, User, UpdateUserProfile, BankAccountData };