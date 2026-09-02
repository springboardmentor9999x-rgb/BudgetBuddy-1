import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import {
  RiLinksLine,
  RiBankCardLine,
  RiVipCrownLine,
  RiShieldUserLine,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

import useAccountStore from '../store/useAccountStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';
import type { UserRole } from '../../auth/types/auth.type.ts';

import AccountCard from '../components/AccountCard.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import BankAccounts from '../components/BankForm.tsx';
import DeleteAccountSection from '../components/DeleteAccountSection.tsx';
import EditProfileForm from '../components/EditProfileForm.tsx';
import ChangePasswordSection from '../components/ChangePasswordSection.tsx';
import UpgradeModal from '../../../components/UpgradeModal.tsx';
import ContentWrapper from '../../../components/ContentWrapper.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';

const AccountPage = () => {
  setPageTitle("Account | BudgetBuddy");
  const bankAccounts = useAccountStore((state) => state.bankAccounts);
  const fetchBankAccounts = useAccountStore((state) => state.fetchBankAccounts);
  const currentUser = useAuthStore((state) => state.user);
  const upgradeTier = useAuthStore((state) => state.upgradeTier);

  const [editMode, setEditModeState] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSwitchingTier, setIsSwitchingTier] = useState(false);

  // fetches the bank accounts when the component mounts
  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const displayUser = currentUser || {
    id: 0,
    email: "—",
    role: "user" as UserRole,
    profile: null,
  };

  const handleTierSwitch = async (targetTier: UserRole) => {
    setIsSwitchingTier(true);
    try {
      await upgradeTier(targetTier);
      toast.success(`Account role changed to ${targetTier.toUpperCase()}`);
    } catch {
      toast.error('Failed to change tier.');
    } finally {
      setIsSwitchingTier(false);
    }
  };

  const currentRole = displayUser.role || 'user';

  const permissionMatrix = [
    {
      feature: 'Expenses & Income Tracking',
      status: '✅ Full (Own Data)',
      roles: ['user', 'premium', 'admin'],
    },
    {
      feature: 'Category Budgets',
      status: currentRole === 'user' ? '⚠️ Basic (Max 5)' : '✅ Advanced (Unlimited)',
      roles: ['user', 'premium', 'admin'],
    },
    {
      feature: 'Milestone Saving Goals',
      status: currentRole === 'user' ? '⚠️ Basic (Max 2)' : '✅ Advanced (Unlimited)',
      roles: ['user', 'premium', 'admin'],
    },
    {
      feature: 'Analytics Dashboard',
      status: currentRole === 'user' ? '✅ Basic Overview' : '✅ Full Predictive Analytics',
      roles: ['user', 'premium', 'admin'],
    },
    {
      feature: 'PDF & Excel Reports',
      status: currentRole === 'user' ? '⚠️ Limited (Transactions Only)' : '✅ Full 4-Sheet Multi-Tab Workbooks & PDF Summaries',
      roles: ['user', 'premium', 'admin'],
    },
    {
      feature: "Cross-User Data Inspection",
      status: currentRole === 'admin' ? '✅ Read-Only Audit' : '❌ Access Denied',
      roles: ['admin'],
    },
    {
      feature: 'User Management & Status Control',
      status: currentRole === 'admin' ? '✅ Full Control' : '❌ Access Denied',
      roles: ['admin'],
    },
    {
      feature: 'System-Wide Analytics & Audit Trail',
      status: currentRole === 'admin' ? '✅ Full Access' : '❌ Access Denied',
      roles: ['admin'],
    },
  ];

  return (
    <ContentWrapper>
      <div className="flex-1 max-width mx-auto w-full py-4 text-gray-200 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/10 rounded-2xl border border-purple-500/20 shadow-lg text-purple-400">
              <FaUserCircle className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Manage your personal profile, subscription tier, credentials, and financial accounts
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

        {/* ── Membership Tier & Permissions Matrix ── */}
        <div className="bg-[#1e252e] rounded-2xl shadow-xl border border-white/5 p-5 md:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 flex items-center justify-center text-amber-400 text-xl border border-amber-500/20">
                {currentRole === 'admin' ? (
                  <RiShieldUserLine className="text-purple-400" />
                ) : (
                  <RiVipCrownLine />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Membership Tier & Authorization
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      currentRole === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : currentRole === 'premium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {currentRole.toUpperCase()} PLAN
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {currentRole === 'admin'
                    ? 'Administrator with full system analytics, audit logging, and user management.'
                    : currentRole === 'premium'
                    ? 'Premium plan with unlimited category budgets, milestone goals, and multi-sheet exports.'
                    : 'Standard free plan with basic budgets (max 5), saving goals (max 2), and transaction exports.'}
                </p>
              </div>
            </div>

            {/* Quick Plan Actions */}
            <div className="flex items-center gap-2">
              {currentRole === 'user' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RiSparklingLine /> Upgrade to Premium
                </button>
              )}

              {/* Administrator Role Switcher */}
              {/* {currentRole === 'admin' && (
                <div className="flex items-center gap-1 bg-[#161c24] p-1 rounded-xl border border-white/10 text-xs">
                  <span className="text-[10px] text-gray-500 px-2 font-mono">Role:</span>
                  {(['user', 'premium', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleTierSwitch(r)}
                      disabled={isSwitchingTier || currentRole === r}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                        currentRole === r
                          ? 'bg-white/15 text-white'
                          : 'text-gray-400 hover:text-white disabled:opacity-30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )} */}
            </div>
          </div>

          {/* Permissions Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 border-b border-white/5 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Capability / Feature</th>
                  <th className="py-2.5 px-3">Your Account Status</th>
                  <th className="py-2.5 px-3 text-right">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {permissionMatrix.map((item, idx) => {
                  const hasAccess = item.roles.includes(currentRole);
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">{item.feature}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-300">{item.status}</td>
                      <td className="py-2.5 px-3 text-right">
                        {hasAccess ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                            <RiCheckLine /> Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                            <RiCloseLine /> Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </ContentWrapper>
  );
};

export default AccountPage;