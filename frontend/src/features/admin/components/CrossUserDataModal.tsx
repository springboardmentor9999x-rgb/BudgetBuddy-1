import React, { useEffect, useState } from 'react';
import {
  RiCloseLine,
  RiShieldCheckLine,
  RiBankCardLine,
  RiWalletLine,
  RiTargetLine,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
} from 'react-icons/ri';
import {
  fetchCrossUserDataApi,
  type CrossUserDataResponse,
} from '../services/admin.api.ts';
import Loading from '../../Loading.tsx';
import toast from 'react-hot-toast';

interface CrossUserDataModalProps {
  userId: number | null;
  onClose: () => void;
}

export const CrossUserDataModal: React.FC<CrossUserDataModalProps> = ({
  userId,
  onClose,
}) => {
  const [data, setData] = useState<CrossUserDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'goals' | 'txns'>('overview');

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetchCrossUserDataApi(userId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to fetch cross user data:', err);
        toast.error('Failed to load user financial records.');
        onClose();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId, onClose]);

  if (!userId) return null;

  const formatCurrency = (amt: number) => `₹${Number(amt || 0).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#161c24] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
              <RiShieldCheckLine />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  User Financial Audit Inspector
                </h2>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Read-Only Inspection
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Viewing live records for{' '}
                <span className="text-white font-semibold">{data?.email || `User #${userId}`}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Content */}
        {isLoading || !data ? (
          <div className="py-24 flex justify-center">
            <Loading />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* User Details & Balance Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#1e252e] p-4 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase">Total Liquid Balance</p>
                <p className="text-xl font-extrabold text-cyan-400 mt-1">{formatCurrency(data.total_balance)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{data.accounts.length} linked accounts</p>
              </div>
              <div className="bg-[#1e252e] p-4 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase">Total Inflow Logged</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(data.total_income_logged)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{data.recent_incomes.length} recorded entries</p>
              </div>
              <div className="bg-[#1e252e] p-4 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase">Total Outflow Logged</p>
                <p className="text-xl font-extrabold text-rose-400 mt-1">{formatCurrency(data.total_expense_logged)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{data.recent_expenses.length} recorded entries</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Bank Accounts ({data.accounts.length})
              </button>
              <button
                onClick={() => setActiveTab('budgets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'budgets'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Budgets ({data.budgets.length})
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'goals'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Saving Goals ({data.saving_goals.length})
              </button>
              <button
                onClick={() => setActiveTab('txns')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'txns'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Recent Transactions
              </button>
            </div>

            {/* Tab 1: Bank Accounts */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Linked Financial Accounts
                </h4>
                {data.accounts.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No bank accounts linked by this user.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="bg-[#1e252e] p-3.5 rounded-xl border border-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
                            <RiBankCardLine size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{acc.bank_name}</p>
                            <p className="text-xs text-gray-400">···{acc.account_number.slice(-4)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-extrabold text-cyan-400">{formatCurrency(acc.balance)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Budgets */}
            {activeTab === 'budgets' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Active Category Limits
                </h4>
                {data.budgets.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No budgets configured by this user.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.budgets.map((b) => (
                      <div
                        key={b.id}
                        className="bg-[#1e252e] p-3.5 rounded-xl border border-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <RiWalletLine size={16} />
                          </div>
                          <span className="text-sm font-semibold text-white">{b.category}</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-400">
                          {formatCurrency(b.monthly_limit)}/mo
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Saving Goals */}
            {activeTab === 'goals' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Savings Goals Progress
                </h4>
                {data.saving_goals.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No saving goals created by this user.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.saving_goals.map((g) => {
                      const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                      return (
                        <div key={g.id} className="bg-[#1e252e] p-3.5 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="font-bold text-white flex items-center gap-2">
                              <RiTargetLine className="text-purple-400" />
                              {g.goal_name}
                            </span>
                            <span className="text-gray-300">
                              {formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)} ({pct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Transactions */}
            {activeTab === 'txns' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Recent Ledger Entries
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.recent_expenses.length === 0 && data.recent_incomes.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No transaction records found.</p>
                  ) : (
                    <>
                      {data.recent_incomes.map((inc) => (
                        <div
                          key={`inc-${inc.id}`}
                          className="bg-[#1e252e] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <RiArrowUpCircleLine size={16} />
                            {inc.source}
                          </span>
                          <span className="text-gray-400">{inc.account || 'Cash'}</span>
                          <span className="font-bold text-emerald-400">+{formatCurrency(inc.amount)}</span>
                        </div>
                      ))}
                      {data.recent_expenses.map((exp) => (
                        <div
                          key={`exp-${exp.id}`}
                          className="bg-[#1e252e] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-2 text-rose-400 font-semibold">
                            <RiArrowDownCircleLine size={16} />
                            {exp.category}
                          </span>
                          <span className="text-gray-400 truncate max-w-xs">{exp.description || exp.account || 'Cash'}</span>
                          <span className="font-bold text-rose-400">-{formatCurrency(exp.amount)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossUserDataModal;
