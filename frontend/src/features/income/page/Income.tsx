import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import IncomeCard from '../components/IncomeCard.tsx';
import IncomeForm from '../components/IncomeForm.tsx';
import DeleteConfirm from '../../DeleteConfirm.tsx';
import { IncomeFilterBar } from '../components/IncomeFilterBar.tsx';

import type { IncomeCreate, Income, IncomeFilterParams } from '../types/income.type.ts';
import useIncomeStore from '../store/useIncomeStore.ts';
import useExpenseStore from '../../expense/store/useExpenseStore.ts';
import Header from '../components/Header.tsx';

import { FaWallet, FaCalendarAlt, FaMinusCircle, FaPiggyBank } from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { GrTransaction } from 'react-icons/gr';
import { useShallow } from 'zustand/shallow';
import { setPageTitle } from '../../../utils/setTitle.ts';
import ContentWrapper from '../../../components/ContentWrapper.tsx';


const IncomePage = () => {

  setPageTitle("Income | BudgetBuddy");
  // ─── Income Store Hooks ────────
  const { incomes, fetchIncomes, deleteIncomeData } = useIncomeStore(
    useShallow((state) => ({
      incomes: state.incomes,
      fetchIncomes: state.fetchIncomes,
      deleteIncomeData: state.deleteIncomeData,
    }))
  );

  // ─── Expense Store Hooks (for Expense Deduction Logic) ────────
  const { expenses, fetchExpenses } = useExpenseStore(
    useShallow((state) => ({
      expenses: state.expenses,
      fetchExpenses: state.fetchExpenses,
    }))
  );

  useEffect(() => {
    try {
      Promise.all([fetchIncomes(), fetchExpenses()]);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      toast.error('Failed to fetch income data. Please try again.');
    }
  }, [fetchIncomes, fetchExpenses]);

  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const handleFilterChange = async (filters: IncomeFilterParams) => {
    setIsFilterLoading(true);
    try {
      await fetchIncomes(filters);
    } catch (error) {
      console.error('Failed to apply income filters:', error);
      toast.error('Failed to filter incomes');
    } finally {
      setIsFilterLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IncomeCreate>({
    source: '',
    amount: 0,
    date: '',
    account: '',
  });

  // ─── Delete modal state ────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setFormData({ source: '', amount: 0, date: new Date().toISOString().split('T')[0], account: '' });
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (income: Income) => {
    setFormData({
      source: income.source,
      amount: income.amount,
      date: income.date,
      account: income.account,
    });
    setEditingId(income.id);
    setShowForm(true);
  };

  // ─── Dynamic Financial Calculations (Expense Deducted from Income) ────────
  const totalIncomes = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netBalance = totalIncomes - totalExpenses;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthIncome = incomes
    .filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const thisMonthExpense = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const thisMonthNet = thisMonthIncome - thisMonthExpense;

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const lastMonthIncome = incomes
    .filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const incomeMoMChange =
    lastMonthIncome > 0
      ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1)
      : thisMonthIncome > 0
        ? '100'
        : '0';

  const retainedRate = totalIncomes > 0 ? Math.max(0, ((netBalance / totalIncomes) * 100)).toFixed(0) : '0';

  // ─── Delete Handlers ────────────────────────────────────────────
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);

    try {
      await deleteIncomeData(deleteId);
      toast.success('Income deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete income. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <ContentWrapper>
      {/* ─── MAIN CONTENT ──────────────────────────────────── */}
      <div className="flex-1 max-width mx-auto w-full">
        {/* Header */}
        <Header openCreateForm={openCreateForm} />

        {/* Incomes Summary Cards (4 Cards with Expense Deduction Logic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Gross Income */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Gross Income</p>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1.5">
                  ₹{totalIncomes.toLocaleString('en-IN')}
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${Number(incomeMoMChange) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {Number(incomeMoMChange) >= 0 ? <MdTrendingUp className="inline" /> : <MdTrendingDown className="inline" />}
                  {Number(incomeMoMChange) >= 0 ? '+' : ''}{incomeMoMChange}% MoM
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaWallet className="text-emerald-400 text-lg" />
              </div>
            </div>
          </div>

          {/* Expenses Deducted */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-rose-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Expenses Deducted</p>
                <p className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1.5">
                  -₹{totalExpenses.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-rose-400/80 mt-1 flex items-center gap-1">
                  <FaMinusCircle size={10} /> Subtracted from income
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaMinusCircle className="text-rose-400 text-lg" />
              </div>
            </div>
          </div>

          {/* Net Remaining Income / Balance */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Net Retained Balance</p>
                <p className={`text-xl sm:text-2xl font-extrabold mt-1.5 ${netBalance >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                  ₹{netBalance.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {retainedRate}% of income retained
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaPiggyBank className="text-purple-400 text-lg" />
              </div>
            </div>
          </div>

          {/* This Month Net */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">This Month Net</p>
                <p className={`text-xl sm:text-2xl font-extrabold mt-1.5 ${thisMonthNet >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {thisMonthNet >= 0 ? '+' : ''}₹{thisMonthNet.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ₹{thisMonthIncome.toLocaleString('en-IN')} earned - ₹{thisMonthExpense.toLocaleString('en-IN')} spent
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaCalendarAlt className="text-cyan-400 text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Income Filters Bar */}
        <IncomeFilterBar
          onFilterChange={handleFilterChange}
          incomes={incomes}
          isLoading={isFilterLoading}
        />

        {/* income list  */}
        <div className="bg-[#1e252e] rounded-xl border border-white/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-[#1a2128] border-b border-white/5">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-200">Recent Transactions</h2>
              <span className="text-gray-400">
                <GrTransaction />
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-white/5 px-2 sm:px-3 py-1 rounded-full">
              {incomes.length} entries
            </span>
          </div>

          {/* List */}
          <div className="divide-y divide-white/5">
            {incomes.length === 0 ? (
              <p className="text-gray-500 text-center py-8 sm:py-12 text-sm sm:text-base px-4">
                No income entries yet. Click "Add Income" to get started.
              </p>
            ) : (
              incomes.map((income) => (
                <IncomeCard
                  key={income.id}
                  income={income}
                  onEdit={() => openEditForm(income)}
                  onDelete={() => handleDeleteClick(income.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL FORM ───────── */}
      {showForm && (
        <IncomeForm
          setShowForm={setShowForm}
          setFormData={setFormData}
          resetForm={resetForm}
          editingId={editingId}
          formData={formData}
        />
      )}

      <DeleteConfirm
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Income"
        message={`Are you sure you want to delete this income entry? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </ContentWrapper >
  );
};


export default IncomePage;