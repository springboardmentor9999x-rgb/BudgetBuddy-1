import { useEffect, useState } from 'react';

import { FaUserCircle } from 'react-icons/fa';
import { RiLinksLine } from 'react-icons/ri';

import useAccountStore from '../store/useAccountStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';

import AccountCard from '../components/AccountCard.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import BankAccounts from '../components/BankForm.tsx';
import DeleteAccountSection from '../components/DeleteAccountSection.tsx';
import EditProfileForm from '../components/EditProfileForm.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';

const AccountPage = () => {
  setPageTitle("Account | BudgetBuddy");
  const bankAccounts = useAccountStore((state) => state.bankAccounts);
  const fetchBankAccounts = useAccountStore((state) => state.fetchBankAccounts);
  const currentUser = useAuthStore((state) => state.user);

  const [setEditMode, setEditModeState] = useState(false);

  // fetches the bank accounts when the component mounts
  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const displayUser = currentUser || {
    email: "—",
    role: "user",
    profile: null,
  };

  return (
    <div className="min-h-screen background-color text-gray-200">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <FaUserCircle className="text-6xl text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Account</h1>
            <p className="text-gray-400">Manage your profile and settings</p>
          </div>
        </div>

        {/* Profile Card & Edit Form */}
        {!setEditMode ? (
          <ProfileCard user={displayUser} setEditMode={setEditModeState} />
        ) : (<EditProfileForm user={{ full_name: displayUser.profile?.full_name, monthly_income: displayUser.profile?.monthly_income }} onCancel={() => setEditModeState(false)} />)}

        {/* Bank Accounts */}
        <BankAccounts />

        {/* List of bank accounts */}
        <div className="bg-[#1e252e] rounded-2xl shadow-lg border border-white/5 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className='text-lg text-green-500'><RiLinksLine /></span>
            <h2 className="text-lg font-semibold text-gray-200">Linked Bank Accounts</h2>
          </div>
          <ul className="space-y-4">
            {bankAccounts.length === 0 ? (
              <li className="text-gray-400">No linked bank accounts.</li>
            ) : (
              bankAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))
            )}
          </ul>
        </div>

        {/* Danger Zone */}
        <DeleteAccountSection />
      </div>
    </div>
  );
};

export default AccountPage;