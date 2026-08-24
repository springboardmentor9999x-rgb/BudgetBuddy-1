import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';

import ExpenseCard from '../components/ExpenseCard.tsx';
import ExpenseForm from '../components/ExpenseForm.tsx';
import DeleteConfirm from '../../DeleteConfirm';

import useExpenseStore from '../store/useExpenseStore.ts';
import useIncomeStore from '../../income/store/useIncomeStore.ts';
import type { ExpenseCreate, Expense } from '../types/expense.type';

import { FaWallet, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import Header from '../components/Header.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';
import ContentWrapper from '../../../components/ContentWrapper.tsx';


const ExpensePage = () => {

  setPageTitle("Expenses | BudgetBuddy");
  // ─── Expense Store Hooks ────────
  const { expenses, fetchExpenses, deleteExistingExpense } = useExpenseStore(
    useShallow((state) => ({
      expenses: state.expenses,
      fetchExpenses: state.fetchExpenses,
      deleteExistingExpense: state.deleteExistingExpense,
    }))
  );

  // ─── Income Store Hooks (for Balance calculation) ────────
  const { incomes, fetchIncomes } = useIncomeStore(
    useShallow((state) => ({
      incomes: state.incomes,
      fetchIncomes: state.fetchIncomes,
    }))
  );

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExpenseCreate>({
    category: '',
    amount: 0,
    description: '',
    date: '',
    account: '',
  });

  // ─── Delete modal state ───────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchExpenses(), fetchIncomes()]);
      } catch (error) {
        console.error('Error fetching expenses or incomes data:', error);
      }
    };
    loadData();
  }, [fetchExpenses, fetchIncomes]);

  const resetForm = () => {
    setFormData({ category: '', amount: 0, description: '', date: new Date().toISOString().split('T')[0], account: '' });
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (expense: Expense) => {
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      account: expense.account,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  // ─── Dynamic Summary Card Calculations ───────
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const thisMonthIncome = incomes
    .filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const thisMonthNet = thisMonthIncome - thisMonthExpenses;

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const lastMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenseMoMChange =
    lastMonthExpenses > 0
      ? (((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100).toFixed(1)
      : thisMonthExpenses > 0
        ? '100'
        : '0';

  const spendRatio = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : '0';

  // ─── Delete Handlers ───────
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);

    try {
      await deleteExistingExpense(deleteId);
      toast.success('Expense deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete expense. Please try again.');
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
    <>
      <ContentWrapper>
        {/* ─── MAIN CONTENT ─────────── */}
        <div className="flex-1 max-width mx-auto w-full">
          {/* Header */}
          <Header openCreateForm={openCreateForm} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Expenses */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-rose-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1.5">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${Number(expenseMoMChange) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Number(expenseMoMChange) <= 0 ? <MdTrendingDown className="inline" /> : <MdTrendingUp className="inline" />}
                    {Number(expenseMoMChange) >= 0 ? '+' : ''}{expenseMoMChange}% MoM
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaWallet className="text-rose-400 text-lg" />
                </div>
              </div>
            </div>

            {/* Net Available Balance */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Net Balance</p>
                  <p className={`text-xl sm:text-2xl font-extrabold mt-1.5 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{balance.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {balance >= 0 ? <MdTrendingUp className="inline" /> : <MdTrendingDown className="inline" />}
                    {balance >= 0 ? 'Income surplus' : 'Deficit overspend'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaChartLine className="text-emerald-400 text-lg" />
                </div>
              </div>
            </div>

            {/* This Month Net */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">This Month Net</p>
                  <p className={`text-xl sm:text-2xl font-extrabold mt-1.5 ${thisMonthNet >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {thisMonthNet >= 0 ? '+' : ''}₹{thisMonthNet.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ₹{thisMonthIncome.toLocaleString('en-IN')} inc - ₹{thisMonthExpenses.toLocaleString('en-IN')} exp
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaCalendarAlt className="text-blue-400 text-lg" />
                </div>
              </div>
            </div>

            {/* Expense / Income Absorption */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Income Spent Rate</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-purple-400 mt-1.5">
                    {spendRatio}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {100 - Number(spendRatio) > 0 ? `${100 - Number(spendRatio)}% saved` : 'Spending >= 100% of income'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaWallet className="text-purple-400 text-lg" />
                </div>
              </div>
            </div>
          </div>


          {/* Recent Expenses List */}
          <div className="bg-[#1e252e] rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a2128] border-b border-white/5">
              <h2 className="text-lg font-semibold text-gray-200">Recent Expenses</h2>
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                {expenses.length} entries
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-white/5">
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No expenses yet. Click "Add Expense" to get started.
                </p>
              ) : (
                expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={() => openEditForm(expense)}
                    onDelete={() => handleDeleteClick(expense.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── MODAL FORM ───────── */}
        {showForm && (
          <ExpenseForm
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
          title="Delete Expense"
          message={`Are you sure you want to delete this expense? This action cannot be undone.`}
          isDeleting={isDeleting}
        />
      </ContentWrapper>
    </>
  );
};


export default ExpensePage;