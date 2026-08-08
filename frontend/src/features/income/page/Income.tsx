import { useState } from 'react';
import toast from 'react-hot-toast';

import IncomeCard from '../components/IncomeCard.tsx';
import IncomeForm from '../components/IncomeForm.tsx';
import DeleteConfirm from '../../DeleteConfirm.tsx';

import type { IncomeCreate } from '../types/income.type.ts';
import useIncomeStore from '../hooks/useIncomeStore.ts';
import Header from '../components/Header.tsx';

import { FaWallet, FaChartLine, FaCalendarAlt } from "react-icons/fa"
import { MdTrendingUp } from "react-icons/md"
import { BsGraphUpArrow } from 'react-icons/bs';
import { GrTransaction } from 'react-icons/gr';

const IncomePage = () => {
  // ─── State ────────
  const { incomes, deleteIncomeData } = useIncomeStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const openEditForm = (income: any) => {
    setFormData({
      source: income.source,
      amount: income.amount,
      date: income.date,
      account: income.account,
    });
    setEditingId(income.id);
    setShowForm(true);
  };

  // ─── Delete Handlers ────────────────────────────────────────────
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);

    try {
      // ─── DELETE HOOK CALL ─────────
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
    <>
      <div className="flex h-screen background-color font-sans">
        {/* ─── MAIN CONTENT ──────────────────────────────────── */}
        <main className="flex-1 px-4 md:px-8 py-4 overflow-auto max-width mx-auto">
          {/* Header */}
          <Header openCreateForm={openCreateForm} />

          {/* Incomes Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Total Incomes */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-green-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Incomes</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 50,000</p>
                  <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                    <MdTrendingUp className="inline" /> 8% from last month
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaWallet className="text-green-400 text-lg sm:text-xl" />
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">This Month</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 5,000</p>
                  <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                    <MdTrendingUp className="inline" /> 15% from last month
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="text-blue-400 text-lg sm:text-xl" />
                </div>
              </div>
            </div>

            {/* This Year */}
            <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">This Year</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 50,000</p>
                  <p className="text-purple-400 text-xs mt-1 flex items-center gap-1">
                    <BsGraphUpArrow /> Total earnings this year
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-purple-400 text-lg sm:text-xl" />
                </div>
              </div>
            </div>
          </div>

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
        </main>

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
          title="Delete Expense"
          message={`Are you sure you want to delete this expense? This action cannot be undone.`}
          isDeleting={isDeleting}
        />
      </div>

    </>
  );
};


export default IncomePage;