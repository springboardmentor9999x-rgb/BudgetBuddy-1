import { useState } from 'react';
import toast from 'react-hot-toast';

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

  return (
    <>
      <div className="flex justify-between items-center bg-[#2a313a] p-4 rounded-lg">
        <div>
          <p className="text-gray-200 font-medium">{account.bank_name}</p>
          <p className="text-gray-400 text-sm">Account ending in {account.account_number.slice(-4)}</p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition"
        >
          Remove
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <DeleteConfirm
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Remove Bank Account"
          message={`Are you sure you want to remove the account ending in ${account.account_number.slice(-4)}? This action cannot be undone.`}
        />
      )}
    </>
  );
};

export default AccountCard;