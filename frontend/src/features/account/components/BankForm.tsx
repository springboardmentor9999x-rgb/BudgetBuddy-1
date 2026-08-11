import React, { useState } from 'react';
import { GiBank } from 'react-icons/gi';
import { IoCreateOutline } from 'react-icons/io5';
import { MdAddCard, MdNumbers, MdAccountBalance, MdAttachMoney, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

import useAccountStore from '../store/useAccountStore.ts';
import type { BankAccountData } from '../types/account.type.ts';


const BankAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BankAccountData>({
    account_number: '',
    bank_name: '',
    balance: 0,
  });

  const resetFormData = () => {
    setFormData({
      account_number: '',
      bank_name: '',
      balance: 0,
    });
  };

  const createBankAccount = useAccountStore((state) => state.createBankAccount);
  const loading = useAccountStore((state) => state.loading);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  // dedicated handler: strips non-digits, caps length at 4
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, account_number: digitsOnly }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createBankAccount({
        account_number: formData.account_number,
        bank_name: formData.bank_name.trim(),
        balance: formData.balance,
      });
      toast.success('Bank account added successfully!');
      resetFormData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to add bank account. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    resetFormData();
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-lg border border-white/5 p-4 md:p-6 mb-6">
      <div className="flex gap-2 items-center mb-2">
        <span className="text-purple-400 text-lg"><GiBank /></span>
        <span className="text-lg font-semibold text-gray-200">Bank Accounts</span>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Manage your linked bank accounts. You can add, remove, or update your bank account information here.
      </p>

      {/* Add Bank Account Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
      >
        <MdAddCard size={20} />
        <span>Add Bank Account</span>
      </button>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e252e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <MdClose size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className='text-lg text-cyan-400'><IoCreateOutline /></span>
              <h3 className="text-lg font-semibold text-gray-200">New Bank Account</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bank Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <MdAccountBalance size={18} />
                  </span>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    title="Bank name is required"
                    required
                    placeholder="e.g. Chase, Bank of America"
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Account Number (Last 4 digits)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <MdNumbers size={18} />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="account_number"
                    min={1000}
                    max={9999}
                    step={1}
                    value={formData.account_number}
                    onChange={handleAccountNumberChange}
                    required
                    title="Last 4 digits of account number"
                    placeholder="Enter account number"
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Initial Balance</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <MdAttachMoney size={18} />
                  </span>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-100/20 transition bg-gray-100/5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition text-sm"
                >
                  <MdAddCard size={18} />
                  <span>Add Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;