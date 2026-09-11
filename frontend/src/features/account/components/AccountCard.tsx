import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiBankCardLine } from 'react-icons/ri';
import { FaTrashAlt } from 'react-icons/fa';

import type { BankAccount } from '../types/account.type.ts';
import useAccountStore from '../store/useAccountStore.ts';
import DeleteConfirm from '../../DeleteConfirm.tsx';

type AccountCardProps = {
  account: BankAccount;
};

const AccountCard = ({ account }: AccountCardProps) => {
  const removeBankAccount = useAccountStore((state) => state.removeBankAccount);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await removeBankAccount(account.id);
      toast.success('Bank account removed successfully!');
      setShowConfirm(false);
    } catch (error: any) {
      console.error('Error removing account:', error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Failed to remove bank account.';
      toast.error(errorMessage);
    }
  };

  const maskedNumber = account.account_number.length >= 4
    ? `•••• •••• •••• ${account.account_number.slice(-4)}`
    : `•••• ${account.account_number}`;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#161c24] hover:bg-[#19222c] border border-white/5 hover:border-purple-500/30 rounded-xl transition-all duration-200 gap-3 group">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl shrink-0 group-hover:scale-105 transition-transform">
            <RiBankCardLine />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white tracking-tight">{account.bank_name}</p>
              <span className="text-[10px] font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                Primary
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-0.5 tracking-wider">{maskedNumber}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase font-semibold text-gray-400">Balance</p>
            <p className="text-sm font-extrabold text-emerald-400">
              ₹{Number(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            title="Remove account"
            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
          >
            <FaTrashAlt size={13} />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <DeleteConfirm
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Remove Bank Account"
          message={`Are you sure you want to remove ${account.bank_name} (${maskedNumber})? This action cannot be undone.`}
        />
      )}
    </>
  );
};

export default AccountCard;