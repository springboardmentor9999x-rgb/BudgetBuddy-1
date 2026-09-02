import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';

import {
  FaPlus,
  FaWallet,
  FaChartPie,
  FaFilter,
  FaExclamationTriangle,
  FaCrown,
} from 'react-icons/fa';
import { RiWalletLine, RiVipCrownLine } from 'react-icons/ri';

import useBudgetStore from '../store/useBudgetStore';
import useExpenseStore from '../../expense/store/useExpenseStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { Budget, BudgetCreate } from '../types/budget.type';

import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import DeleteConfirm from '../../DeleteConfirm';
import UpgradeModal from '../../../components/UpgradeModal';
import ContentWrapper from '../../../components/ContentWrapper';
import { setPageTitle } from '../../../utils/setTitle';

// Month names for filter
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const blankForm = (): BudgetCreate => ({
  category: '',
  monthly_limit: 0,
});

const BudgetPage = () => {
  setPageTitle('Budget | BudgetBuddy');

  const { budgets, isLoading, fetchBudgets, deleteBudget } = useBudgetStore(
    useShallow((s) => ({
      budgets: s.budgets,
      isLoading: s.isLoading,
      fetchBudgets: s.fetchBudgets,
      deleteBudget: s.deleteBudget,
    }))
  );

  const { expenses, fetchExpenses } = useExpenseStore(
    useShallow((s) => ({ expenses: s.expenses, fetchExpenses: s.fetchExpenses }))
  );

  const user = useAuthStore((s) => s.user);

  const [showForm, setShowForm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetCreate>(blankForm());

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters: month & year for filtering budgets by creation month
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState<number>(now.getMonth());
  const [filterYear, setFilterYear] = useState<number>(now.getFullYear());

  useEffect(() => {
    Promise.all([fetchBudgets(), fetchExpenses()]);
  }, [fetchBudgets, fetchExpenses]);

  // ── Spending per category for the selected month ────────────────────────────
  const spendByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === filterMonth && d.getFullYear() === filterYear) {
        map[e.category] = (map[e.category] ?? 0) + Number(e.amount);
      }
    });
    return map;
  }, [expenses, filterMonth, filterYear]);

  // ── Display all active budgets evaluating against selected month spending ───
  const activeBudgets = budgets;

  // ── Summary stats for selected month ───────────────────────────────────────
  const totalLimit = activeBudgets.reduce((s, b) => s + Number(b.monthly_limit), 0);
  const totalSpent = activeBudgets.reduce((s, b) => s + (spendByCategory[b.category] ?? 0), 0);
  const overspentCount = activeBudgets.filter(
    (b) => (spendByCategory[b.category] ?? 0) > Number(b.monthly_limit)
  ).length;
  const overallPct = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  const isBasicUser = user?.role === 'user';
  const isAtBasicLimit = isBasicUser && budgets.length >= 5;

  // ── Unique years from expenses & budgets ───────────────────────────────────
  const yearOptions = useMemo(() => {
    const currentY = now.getFullYear();
    const yrs = new Set([currentY, currentY - 1, currentY + 1]);
    budgets.forEach((b) => {
      if (b.created_at) yrs.add(new Date(b.created_at).getFullYear());
    });
    expenses.forEach((e) => {
      if (e.date) yrs.add(new Date(e.date).getFullYear());
    });
    return Array.from(yrs).sort((a, b) => a - b);
  }, [budgets, expenses]);

  // ── Open forms ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    if (isAtBasicLimit) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingBudget(null);
    setFormData(blankForm());
    setShowForm(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({ category: budget.category, monthly_limit: budget.monthly_limit });
    setShowForm(true);
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteBudget(deleteId);
      toast.success('Budget deleted successfully!');
    } catch {
      toast.error('Failed to delete budget.');
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
              <div className="p-2 sm:p-3 bg-linear-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/20 shadow-lg">
                <RiWalletLine className="text-2xl sm:text-3xl text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Budgets
                  </h1>
                  {isBasicUser ? (
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      Basic Plan (Max 5)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <RiVipCrownLine /> Premium (Unlimited)
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">
                  Set monthly limits. Monitor your spending.
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="group relative bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center cursor-pointer"
            >
              <div className="absolute inset-0 bg-linear-to-r from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaPlus className="text-sm sm:text-base group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium text-sm sm:text-base">Add Budget</span>
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
                  <h4 className="text-xs font-bold text-white">Basic Tier Limit Reached (5 / 5 Budgets)</h4>
                  <p className="text-xs text-gray-400">
                    Upgrade to Premium to track unlimited categories with advanced financial insights.
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Total Spent */}
            <div className={`bg-[#1e252e] rounded-xl p-5 border transition-all duration-300 group
              ${overallPct >= 100 ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/5 hover:border-cyan-500/30'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Spent</p>
                  <p className={`text-2xl font-bold mt-2 ${overallPct >= 100 ? 'text-red-400' : 'text-white'}`}>
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </p>
                  <p className="text-cyan-400 text-xs mt-1">of ₹{totalLimit.toLocaleString('en-IN')} budgeted</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300
                  ${overallPct >= 100 ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}>
                  <FaWallet className={`text-xl ${overallPct >= 100 ? 'text-red-400' : 'text-cyan-400'}`} />
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    overallPct >= 100
                      ? 'bg-linear-to-r from-red-500 to-rose-600'
                      : overallPct >= 80
                        ? 'bg-linear-to-r from-amber-400 to-orange-500'
                        : 'bg-linear-to-r from-cyan-400 to-teal-500'
                  }`}
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <p className="text-gray-600 text-[10px] mt-1">{overallPct.toFixed(1)}% of total limit</p>
            </div>

            {/* Active Budgets */}
            <div className="bg-[#1e252e] rounded-xl p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Budgets</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {budgets.length} {isBasicUser ? '/ 5' : ''}
                  </p>
                  <p className="text-purple-400 text-xs mt-1">
                    {isBasicUser ? 'Basic plan limit' : 'unlimited tracking'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartPie className="text-purple-400 text-xl" />
                </div>
              </div>
            </div>

            {/* Overspent */}
            <div className={`bg-[#1e252e] rounded-xl p-5 border transition-all duration-300 group
              ${overspentCount > 0 ? 'border-red-500/30' : 'border-white/5 hover:border-emerald-500/30'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Overspent</p>
                  <p className={`text-2xl font-bold mt-2 ${overspentCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {overspentCount}
                  </p>
                  <p className={`text-xs mt-1 ${overspentCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {overspentCount > 0 ? 'categories over limit ⚠️' : 'all within limits ✓'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300
                  ${overspentCount > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                  <FaExclamationTriangle className={`text-xl ${overspentCount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="bg-[#1e252e] rounded-xl border border-white/5 p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
                <FaFilter size={11} /> Filter by Month
              </div>

              {/* Month */}
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                className="bg-[#161c24] border border-white/10 text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>

              {/* Year */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="bg-[#161c24] border border-white/10 text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              <span className="ml-auto text-xs text-gray-600">
                {activeBudgets.length} active {activeBudgets.length === 1 ? 'budget' : 'budgets'}
              </span>
            </div>
          </div>

          {/* ── Budgets Grid ─────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : activeBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <RiWalletLine className="text-cyan-400 text-4xl" />
              </div>
              <p className="text-gray-400 text-lg font-semibold">No budgets found</p>
              <p className="text-gray-600 text-sm">
                Create your first monthly budget to monitor and control your spending.
              </p>
              <button
                onClick={openCreate}
                className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <FaPlus /> Create First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  spent={spendByCategory[budget.category] ?? 0}
                  onEdit={() => openEdit(budget)}
                  onDelete={() => setDeleteId(budget.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ContentWrapper>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {showForm && (
        <BudgetForm
          editingBudget={editingBudget}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Unlimited Category Budgets"
        reason="Basic users are limited to 3 active budgets. Upgrade to Premium for unlimited category budgets and real-time health tracking."
      />

      <DeleteConfirm
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BudgetPage;