
interface CreateBankAccountFormData {
  account_number: string;
  bank_name: string;
  balance: number;
};

interface BankAccount extends CreateBankAccountFormData {
  id: number;
}

export type { CreateBankAccountFormData, BankAccount };