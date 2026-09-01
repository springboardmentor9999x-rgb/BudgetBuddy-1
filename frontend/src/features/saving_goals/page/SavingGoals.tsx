import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';

import {
  FaPlus,
  FaFlag,
  FaTrophy,
  FaChartLine,
  FaFilter,
  FaTimes,
  FaWallet,
  FaSpinner,
  FaCrown,
} from 'react-icons/fa';
import { RiTargetLine, RiVipCrownLine } from 'react-icons/ri';

import useSavingGoalStore from '../store/useSavingGoalStore';
import useAccountStore from '../../account/store/useAccountStore';
import useExpenseStore from '../../expense/store/useExpenseStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { SavingGoal, SavingGoalCreate } from '../types/saving.type';
import type { BankAccount } from '../../account/types/account.type';

import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';
import ContributeModal from '../components/ContributeModal';
import DeleteConfirm from '../../DeleteConfirm';
import UpgradeModal from '../../../components/UpgradeModal';
import ContentWrapper from '../../../components/ContentWrapper';
import { setPageTitle } from '../../../utils/setTitle';


const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const blankForm = (): SavingGoalCreate => ({
  goal_name: '',
  target_amount: 0,
  current_amount: 0,
  target_date: '',
});

// ── Account Picker Modal ────────────────────────────────────────────────────────
interface AccountPickerProps {
  goal: SavingGoal;
  accounts: BankAccount[];
  onConfirm: (accountId: number) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const AccountPickerModal = ({ goal, accounts, onConfirm, onCancel, isProcessing }: AccountPickerProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(accounts[0]?.id ?? null);
  const amount = Number(goal.target_amount);

  const selectedAcc = accounts.find((a) => a.id === selectedId);
  const hasEnough = selectedAcc ? Number(selectedAcc.balance) >= amount : false;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/10 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-600/20 rounded-lg">
            <FaTrophy className="text-emerald-400 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Complete Goal</h2>
            <p className="text-gray-400 text-xs">"{goal.goal_name}"</p>
          </div>
          <button onClick={onCancel} className="ml-auto text-gray-500 hover:text-white transition-colors cursor-pointer">
            <FaTimes size={18} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Select the account to deduct{' '}
          <span className="text-white font-semibold">₹{amount.toLocaleString('en-IN')}</span> from.
          This will mark the goal as complete.
        </p>

        {/* Account list */}
        <div className="space-y-2 mb-5 max-h-52 overflow-y-auto">
          {accounts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No bank accounts found.</p>
          ) : (
            accounts.map((acc) => {
              const bal = Number(acc.balance);
              const enough = bal >= amount;
              return (
                <button
                  key={acc.id}
                  onClick={() => enough && setSelectedId(acc.id)}
                  disabled={!enough}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                    ${selectedId === acc.id
                      ? 'border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                      : enough
                        ? 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                        : 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${selectedId === acc.id ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                    <FaWallet className={selectedId === acc.id ? 'text-emerald-400' : 'text-gray-500'} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{acc.bank_name}</p>
                    <p className="text-gray-500 text-xs">···{acc.account_number.slice(-4)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{bal.toLocaleString('en-IN')}
                    </p>
                    {!enough && (
                      <p className="text-[10px] text-red-500">Insufficient</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Warning if insufficient */}
        {selectedAcc && !hasEnough && (
          <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            ⚠️ Selected account has insufficient balance for this goal.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => selectedId && onConfirm(selectedId)}
            disabled={!selectedId || !hasEnough || isProcessing || accounts.length === 0}
            className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            {isProcessing ? (
              <><FaSpinner className="animate-spin" /> Processing...</>
            ) : (
              <><FaTrophy size={13} /> Complete & Deduct</>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────────
const SavingGoals = () => {
  setPageTitle('Saving Goals | BudgetBuddy');

  const { goals, isLoading, fetchGoals, updateGoal, contributeToGoal, deleteGoal } =
    useSavingGoalStore(
      useShallow((s) => ({
        goals: s.goals,
        isLoading: s.isLoading,
        fetchGoals: s.fetchGoals,
        updateGoal: s.updateGoal,
        contributeToGoal: s.contributeToGoal,
        deleteGoal: s.deleteGoal,
      }))
    );

  const { bankAccounts, fetchBankAccounts } = useAccountStore(
    useShallow((s) => ({
      bankAccounts: s.bankAccounts,
      fetchBankAccounts: s.fetchBankAccounts,
    }))
  );

  const user = useAuthStore((s) => s.user);
  const addNewExpense = useExpenseStore((s) => s.addNewExpense);

  const [showForm, setShowForm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [formData, setFormData] = useState<SavingGoalCreate>(blankForm());

  // Contribute modal
  const [contributeGoal, setContributeGoal] = useState<SavingGoal | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Account picker for goal completion
  const [completeGoal, setCompleteGoal] = useState<SavingGoal | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchGoals();
    fetchBankAccounts();
  }, [fetchGoals, fetchBankAccounts]);

  const isBasicUser = user?.role === 'user';
  const isAtBasicLimit = isBasicUser && goals.length >= 2;

  // ── Always sort goals by shortest target date first ─────────────────────────
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const timeA = new Date(a.target_date).getTime();
      const timeB = new Date(b.target_date).getTime();
      return timeA - timeB;
    });
  }, [goals]);


  // ── Dynamic Waterfall Savings Allocation (Shortest Target Date First) ───────
  const totalUserSavings = bankAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  const { goalSavedMap, totalEffectiveSaved, completedCount } = useMemo(() => {
    let pool = totalUserSavings;
    const map: Record<number, { effectiveSaved: number; fromPool: number; manual: number }> = {};
    let totalEff = 0;
    let completed = 0;

    // Allocate funds to goals with shortest target date first!
    sortedGoals.forEach((g) => {
      const manual = Number(g.current_amount);
      const target = Number(g.target_amount);

      let effectiveSaved = manual;
      let fromPool = 0;

      if (manual >= target) {
        effectiveSaved = target;
      } else {
        const needed = target - manual;
        fromPool = Math.min(needed, Math.max(0, pool));
        effectiveSaved = manual + fromPool;
        pool -= fromPool;
      }

      if (effectiveSaved >= target) {
        completed++;
      }

      totalEff += effectiveSaved;
      map[g.id] = { effectiveSaved, fromPool, manual };
    });

    return { goalSavedMap: map, totalEffectiveSaved: totalEff, completedCount: completed };
  }, [sortedGoals, totalUserSavings]);

  // Identify the single active goal with the shortest target date
  const shortestDateGoalId = useMemo(() => {
    const activeUncompleted = sortedGoals.filter((g) => {
      const savedInfo = goalSavedMap[g.id];
      const eff = savedInfo ? savedInfo.effectiveSaved : Number(g.current_amount);
      return eff < Number(g.target_amount);
    });
    return activeUncompleted.length > 0 ? activeUncompleted[0].id : null;
  }, [sortedGoals, goalSavedMap]);

  // ── Filtered goals (maintaining shortest target date ordering) ──────────────
  const filteredGoals = useMemo(() => {
    return sortedGoals.filter((g) => {
      const d = new Date(g.target_date);
      const monthOk = filterMonth === null || d.getMonth() === filterMonth;
      const yearOk = filterYear === null || d.getFullYear() === filterYear;
      const savedInfo = goalSavedMap[g.id];
      const eff = savedInfo ? savedInfo.effectiveSaved : Number(g.current_amount);
      const target = Number(g.target_amount);
      const pct = target > 0 ? (eff / target) * 100 : 0;
      const statusOk =
        filterStatus === 'all' ||
        (filterStatus === 'completed' && pct >= 100) ||
        (filterStatus === 'active' && pct < 100);
      return monthOk && yearOk && statusOk;
    });
  }, [sortedGoals, filterMonth, filterYear, filterStatus, goalSavedMap]);

  const overallPct = totalTarget > 0 ? Math.min(100, (totalEffectiveSaved / totalTarget) * 100) : 0;

  const yearOptions = useMemo(() => {
    const yrs = Array.from(new Set(goals.map((g) => new Date(g.target_date).getFullYear())));
    return yrs.sort((a, b) => a - b);
  }, [goals]);

  // ── Open forms ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    if (isAtBasicLimit) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingGoal(null);
    setFormData(blankForm());
    setShowForm(true);
  };

  const openEdit = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date,
    });
    setShowForm(true);
  };

  // ── Mark Complete: pick account → create expense transaction → deduct bank balance → update goal ──
  const handleCompleteConfirm = async (accountId: number) => {
    if (!completeGoal) return;
    setIsCompleting(true);
    try {
      const amount = Number(completeGoal.target_amount);
      const selectedAcc = bankAccounts.find((a) => a.id === accountId);
      const accountLabel = selectedAcc
        ? `${selectedAcc.bank_name} (${selectedAcc.account_number})`
        : 'Cash';

      await addNewExpense({
        category: 'Shopping',
        amount: amount,
        description: `Achieved goal purchase: ${completeGoal.goal_name}`,
        date: new Date().toISOString(),
        account: accountLabel,
      });

      await updateGoal(completeGoal.id, { current_amount: amount });
      await fetchBankAccounts();
      await fetchGoals();

      toast.success(`"Achieved goal purchase: ${completeGoal.goal_name}" created & ₹${amount.toLocaleString('en-IN')} deducted!`);
      setCompleteGoal(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? 'Failed to complete goal. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // ── Contribute handler ──────────────────────────────────────────────────────
  const handleContribute = async (goalId: number, amount: number, accountId?: number) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    const prevCurrent = targetGoal ? Number(targetGoal.current_amount) : 0;
    const targetAmt = targetGoal ? Number(targetGoal.target_amount) : 0;

    await contributeToGoal(goalId, amount, accountId);
    await fetchGoals();
    if (accountId) {
      await fetchBankAccounts();
    }

    const newCurrent = prevCurrent + amount;
    const newPct = targetAmt > 0 ? (newCurrent / targetAmt) * 100 : 0;
    const prevPct = targetAmt > 0 ? (prevCurrent / targetAmt) * 100 : 0;

    if (newPct >= 100 && prevPct < 100) {
      toast.success(`🎉 Goal Completed! "${targetGoal?.goal_name}" is 100% funded!`);
    } else if (newPct >= 90 && prevPct < 90) {
      toast.success(`🔥 90% Milestone reached for "${targetGoal?.goal_name}"!`);
    } else {
      toast.success(`Contributed ₹${amount.toLocaleString('en-IN')} to "${targetGoal?.goal_name || 'Goal'}"!`);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteGoal(deleteId);
      toast.success('Goal deleted successfully!');
    } catch {
      toast.error('Failed to delete goal.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <ContentWrapper>
        <div className="flex-1 max-width mx-auto w-full py-4">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-linear-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/20 shadow-lg">
                <RiTargetLine className="text-2xl sm:text-3xl text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Saving Goals
                  </h1>
                  {isBasicUser ? (
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      Basic Plan (Max 2)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <RiVipCrownLine /> Premium (Unlimited)
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">
                  Set targets. Track progress. Achieve milestones.
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="group relative bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center cursor-pointer"
            >
              <div className="absolute inset-0 bg-linear-to-r from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaPlus className="text-sm sm:text-base group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium text-sm sm:text-base">Add Goal</span>
              <span className="absolute inset-0 rounded-xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
            </button>
          </div>

          {/* ── Basic Tier Alert Banner (if at limit) ── */}
          {isAtBasicLimit && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1e252e] to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 text-lg">
                  <FaCrown />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">Basic Tier Limit Reached (2 / 2 Goals)</h4>
                  <p className="text-xs text-gray-400">
                    Upgrade to Premium to track unlimited saving targets and milestone predictions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* ── Summary Cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total User Savings */}
            <div className="bg-[#1e252e] rounded-xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">User Bank Savings</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-2">₹{totalUserSavings.toLocaleString('en-IN')}</p>
                  <p className="text-gray-500 text-xs mt-1">Available in accounts</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaWallet className="text-emerald-400 text-xl" />
                </div>
              </div>
            </div>

            {/* Total Saved in Goals */}
            <div className="bg-[#1e252e] rounded-xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Saved in Goals</p>
                  <p className="text-2xl font-bold text-white mt-2">₹{totalEffectiveSaved.toLocaleString('en-IN')}</p>
                  <p className="text-cyan-400 text-xs mt-1">of ₹{totalTarget.toLocaleString('en-IN')} targeted</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-cyan-400 text-xl" />
                </div>
              </div>
              <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <p className="text-gray-600 text-[10px] mt-1">{overallPct.toFixed(1)}% overall progress</p>
            </div>

            {/* Active Goals */}
            <div className="bg-[#1e252e] rounded-xl p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Goals</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {goals.length - completedCount} {isBasicUser ? '/ 2' : ''}
                  </p>
                  <p className="text-purple-400 text-xs mt-1">
                    {isBasicUser ? 'Basic plan limit' : 'in progress'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaFlag className="text-purple-400 text-xl" />
                </div>
              </div>
            </div>

            {/* Completed Goals */}
            <div className="bg-[#1e252e] rounded-xl p-5 border border-white/5 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Completed</p>
                  <p className="text-2xl font-bold text-white mt-2">{completedCount}</p>
                  <p className="text-amber-400 text-xs mt-1">goals achieved 🏆</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaTrophy className="text-amber-400 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="bg-[#1e252e] rounded-xl border border-white/5 p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
                <FaFilter size={11} /> Filters
              </div>

              {/* Status */}
              <div className="flex gap-1.5">
                {(['all', 'active', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-200 cursor-pointer ${
                      filterStatus === s
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Month */}
              <select
                value={filterMonth ?? ''}
                onChange={(e) => setFilterMonth(e.target.value === '' ? null : Number(e.target.value))}
                className="bg-[#161c24] border border-white/10 text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>

              {/* Year */}
              <select
                value={filterYear ?? ''}
                onChange={(e) => setFilterYear(e.target.value === '' ? null : Number(e.target.value))}
                className="bg-[#161c24] border border-white/10 text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Years</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              {(filterMonth !== null || filterYear !== null || filterStatus !== 'all') && (
                <button
                  onClick={() => { setFilterMonth(null); setFilterYear(null); setFilterStatus('all'); }}
                  className="text-xs text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  ✕ Clear filters
                </button>
              )}

              <span className="ml-auto text-xs text-gray-600">
                {filteredGoals.length} / {goals.length} goals
              </span>
            </div>
          </div>

          {/* ── Goals Grid ──────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <RiTargetLine className="text-purple-400 text-4xl" />
              </div>
              <p className="text-gray-400 text-lg font-semibold">No goals found</p>
              <p className="text-gray-600 text-sm">
                {goals.length === 0
                  ? 'Start by creating your first saving goal!'
                  : 'Try adjusting the filters above.'}
              </p>
              {goals.length === 0 && (
                <button
                  onClick={openCreate}
                  className="mt-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <FaPlus /> Create First Goal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredGoals.map((goal) => {
                const savedInfo = goalSavedMap[goal.id] || {
                  effectiveSaved: Number(goal.current_amount),
                  fromPool: 0,
                  manual: Number(goal.current_amount),
                };
                return (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    effectiveSaved={savedInfo.effectiveSaved}
                    fromPool={savedInfo.fromPool}
                    isShortestDate={goal.id === shortestDateGoalId}
                    onEdit={() => openEdit(goal)}
                    onDelete={() => setDeleteId(goal.id)}
                    onComplete={() => setCompleteGoal(goal)}
                    onContribute={() => setContributeGoal(goal)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </ContentWrapper>

      {/* ── Contribute Modal ─────────────────────────────────────────────── */}
      <ContributeModal
        isOpen={contributeGoal !== null}
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onContribute={handleContribute}
      />

      {/* ── Account Picker Modal ─────────────────────────────────────────── */}
      {completeGoal && (
        <AccountPickerModal
          goal={completeGoal}
          accounts={bankAccounts}
          onConfirm={handleCompleteConfirm}
          onCancel={() => !isCompleting && setCompleteGoal(null)}
          isProcessing={isCompleting}
        />
      )}

      {/* ── Goal Form Modal ──────────────────────────────────────────────── */}
      {showForm && (
        <GoalForm
          editingGoal={editingGoal}
          formData={formData}
          setFormData={setFormData}
          totalUserSavings={totalUserSavings}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Unlimited Saving Goals"
        reason="Basic plan allows up to 2 active savings goals. Upgrade to Premium for unlimited goal tracking and automated waterfall allocation."
      />

      <DeleteConfirm
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal"
        message="Are you sure you want to delete this saving goal? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SavingGoals;
