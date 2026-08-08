import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ExpenseCard from '../components/ExpenseCard.tsx';
import ExpenseForm from '../components/ExpenseForm.tsx';
import DeleteConfirm from '../../DeleteConfirm';

import useExpenseStore from '../hooks/useExpenseStore';
import type { ExpenseCreate, Expense } from '../types/expense.type';

import { FaWallet, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import Header from '../components/Header.tsx';


const ExpensePage = () => {
  // ─── Expense Store Hooks ─────────────────────────────
  const { expenses, fetchExpenses, deleteExistingExpense } = useExpenseStore();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExpenseCreate>({
    category: '',
    amount: 0,
    description: '',
    date: '',
    account: '',
  });

  // ─── Delete modal state ────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    try {
      fetchExpenses();
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }, []);

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
      <div className="flex h-screen background-color font-sans">
        {/* ─── MAIN CONTENT ─────────── */}
        <main className="flex-1 px-4 md:px-8 py-4 overflow-auto max-width mx-auto">
          {/* Header */}
          <Header openCreateForm={openCreateForm} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Total Expenses */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-red-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 50,000</p>
                  <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                    <MdTrendingUp className="inline" /> 12% from last month
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaWallet className="text-red-400 text-lg sm:text-xl" />
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-green-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Balance</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 5,000</p>
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <MdTrendingDown className="inline" /> 5% from last month
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-green-400 text-lg sm:text-xl" />
                </div>
              </div>
            </div>

            {/* This Year */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">This Year</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 50,000</p>
                  <p className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                    📈 Total income this year
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="text-blue-400 text-lg sm:text-xl" />
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
        </main>

        {/* ─── MODAL FORM ────────────────────────────────────── */}
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
      </div>
    </>
  );
};


export default ExpensePage;