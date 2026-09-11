import React, { useState } from 'react';
import { GiBank } from 'react-icons/gi';
import { IoCreateOutline } from 'react-icons/io5';
import { MdAddCard, MdNumbers, MdAccountBalance, MdAttachMoney, MdClose } from 'react-icons/md';
import { RiBankCardLine, RiShieldCheckLine } from 'react-icons/ri';
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
  const bankAccounts = useAccountStore((state) => state.bankAccounts);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  // Dedicated handler: strips non-digits, caps length at 4
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData((prev) => ({ ...prev, account_number: digitsOnly }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.bank_name.trim()) {
      toast.error('Please enter a bank name.');
      return;
    }
    if (!formData.account_number || formData.account_number.length !== 4) {
      toast.error('Please enter the last 4 digits of your account number.');
      return;
    }

    try {
      await createBankAccount({
        account_number: formData.account_number,
        bank_name: formData.bank_name.trim(),
        balance: Number(formData.balance || 0),
      });
      toast.success('Bank account linked successfully! 💳');
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

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-xl border border-white/5 p-6 mb-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-emerald-400">
            <GiBank size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Financial Accounts</h2>
              <span className="text-xs bg-emerald-500/15 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/25">
                {bankAccounts.length} {bankAccounts.length === 1 ? 'Account' : 'Accounts'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Total Balance: <span className="font-extrabold text-emerald-400">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all duration-200"
        >
          <MdAddCard size={16} />
          <span>Link New Account</span>
        </button>
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1e252e] to-[#161c24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 transition-colors"
            >
              <MdClose size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-purple-600/20 rounded-xl text-purple-400">
                <IoCreateOutline size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Link Bank Account</h3>
                <p className="text-xs text-gray-400">Enter bank details to track account balance</p>
              </div>
            </div>

            {/* Live Card Mockup Preview */}
            <div className="w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-4 rounded-xl border border-white/15 shadow-inner mb-5 relative overflow-hidden text-white">
              <div className="flex justify-between items-start mb-6">
                <span className="font-bold text-xs uppercase tracking-wider text-purple-300">
                  {formData.bank_name || 'BANK NAME'}
                </span>
                <RiBankCardLine className="text-2xl text-purple-400 opacity-80" />
              </div>

              <div className="font-mono text-sm tracking-widest text-gray-300 mb-3">
                •••• •••• •••• {formData.account_number || 'XXXX'}
              </div>

              <div className="flex justify-between items-end text-[11px] text-gray-400">
                <span>Initial Balance</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{Number(formData.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Bank Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <MdAccountBalance size={16} />
                  </span>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-xs text-gray-200 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition uppercase"
                  />
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Account Number (Last 4 Digits)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <MdNumbers size={16} />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="account_number"
                    maxLength={4}
                    value={formData.account_number}
                    onChange={handleAccountNumberChange}
                    required
                    placeholder="e.g. 4321"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-xs text-gray-200 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 font-mono tracking-widest transition"
                  />
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Initial Balance (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-400">
                    <MdAttachMoney size={16} />
                  </span>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-xs text-gray-200 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 rounded-xl border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-lg shadow-purple-600/20 transition"
                >
                  <RiShieldCheckLine size={15} />
                  <span>{loading ? 'Linking...' : 'Link Account'}</span>
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