import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { RiLinksLine, RiBankCardLine } from 'react-icons/ri';

import useAccountStore from '../store/useAccountStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';

import AccountCard from '../components/AccountCard.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import BankAccounts from '../components/BankForm.tsx';
import DeleteAccountSection from '../components/DeleteAccountSection.tsx';
import EditProfileForm from '../components/EditProfileForm.tsx';
import ChangePasswordSection from '../components/ChangePasswordSection.tsx';
import ContentWrapper from '../../../components/ContentWrapper.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';

const AccountPage = () => {
  setPageTitle("Account | BudgetBuddy");
  const bankAccounts = useAccountStore((state) => state.bankAccounts);
  const fetchBankAccounts = useAccountStore((state) => state.fetchBankAccounts);
  const currentUser = useAuthStore((state) => state.user);

  const [editMode, setEditModeState] = useState(false);

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
    <ContentWrapper>
      <div className="flex-1 max-width mx-auto w-full py-4 text-gray-200">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/10 rounded-2xl border border-purple-500/20 shadow-lg text-purple-400">
              <FaUserCircle className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Manage your personal profile, security credentials, and financial accounts
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card & Edit Form */}
        {!editMode ? (
          <ProfileCard user={displayUser} setEditMode={setEditModeState} />
        ) : (
          <EditProfileForm
            user={{
              full_name: displayUser.profile?.full_name,
              monthly_income: displayUser.profile?.monthly_income,
            }}
            onCancel={() => setEditModeState(false)}
          />
        )}

        {/* Security & Password Reset Section */}
        <ChangePasswordSection userEmail={displayUser.email} />

        {/* Bank Accounts Form & List Section */}
        <div className="space-y-4 mb-6">
          <BankAccounts />

          {/* List of bank accounts */}
          <div className="bg-[#1e252e] rounded-2xl shadow-xl border border-white/5 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-base text-emerald-400"><RiLinksLine /></span>
                <h3 className="text-sm font-bold text-white tracking-tight">Linked Bank Accounts</h3>
              </div>
              <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 font-mono">
                {bankAccounts.length} Active
              </span>
            </div>

            {bankAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                  <RiBankCardLine />
                </div>
                <p className="text-sm font-semibold text-gray-300">No bank accounts linked yet</p>
                <p className="text-xs text-gray-500 max-w-sm">
                  Link your primary savings or checking account above to start tracking real-time balances.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {bankAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <DeleteAccountSection />
      </div>
    </ContentWrapper>
  );
};

export default AccountPage;