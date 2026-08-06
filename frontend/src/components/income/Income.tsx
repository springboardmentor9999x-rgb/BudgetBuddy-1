import { useEffect, useState } from 'react';
import {
  FaPlus,
  FaSpinner,
} from 'react-icons/fa';

import { api } from '../../api/api';
import toast, { Toaster } from 'react-hot-toast';
import IncomeCard from './IncomeCard';
import IncomeForm from './IncomeForm';
import DeleteConfirm from '../DeleteConfirm';

type IncomePageProps = {
  id: number;
  source: string;
  amount: number;
  date: string;
  account: string;
};

const IncomePage = () => {
  // ─── State ──────────────────────────────────────────────
  const [incomes, setIncomes] = useState<IncomePageProps[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: '',
    account: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch incomes from API on component mount
    const fetchIncomes = async () => {
      try {
        const response = await api.get('incomes/incomes');
        setIncomes(response.data);
      } catch (err) {
        console.error('Failed to fetch incomes:', err);
        toast.error('Failed to load incomes.');
      }
    };

    fetchIncomes();
  }, []);


  const resetForm = () => {
    setFormData({ source: '', amount: '', date: '', account: '' });
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

  // ─── Handlers ────────────────────────────────────────────
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);

    try {
      // ─── DELETE API CALL ──────────────────────────────
      await api.delete(`/incomes/income/${deleteId}`);
      // Remove from local state
      setIncomes((prev) => prev.filter((inc) => inc.id !== deleteId));
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

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      <div className="flex h-screen background-color font-sans">
        {/* ─── MAIN CONTENT ──────────────────────────────────── */}
        <main className="flex-1 px-4 md:px-8 py-4 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-200">Income</h1>
            <button
              onClick={openCreateForm}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition flex items-center gap-2"
            >
              <FaPlus /> <span className="hidden sm:inline">Add Income</span>
            </button>
          </div>

          {/* Income Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incomes.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-12">
                No income entries yet. Click “Add Income” to get started.
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
        </main>

        {/* ─── MODAL FORM ────────────────────────────────────── */}
        {showForm && (
          // <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          //   <div className="background-color rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/10">
          //     <h2 className="text-2xl font-bold text-gray-200 mb-4">
          //       {editingId ? 'Edit Income' : 'New Income'}
          //     </h2>

          //     <form onSubmit={handleSubmit} className="space-y-4">
          //       {/* Source */}
          //       <div>
          //         <label className="block text-sm font-medium text-gray-200">Source</label>
          //         <input
          //           type="text"
          //           name="source"
          //           value={formData.source}
          //           onChange={handleInputChange}
          //           placeholder="e.g. Salary, Freelance"
          //           className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          //           required
          //         />
          //       </div>

          //       {/* Amount */}
          //       <div>
          //         <label className="block text-sm font-medium text-gray-200">Amount (Rs.)</label>
          //         <input
          //           type="number"
          //           name="amount"
          //           value={formData.amount}
          //           onChange={handleInputChange}
          //           placeholder="0.00"
          //           step="0.01"
          //           min="0"
          //           className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          //           required
          //         />
          //       </div>

          //       {/* Date */}
          //       <div>
          //         <label className="block text-sm font-medium text-gray-200">Date</label>
          //         <input
          //           type="date"
          //           name="date"
          //           value={formData.date}
          //           onChange={handleInputChange}
          //           className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          //           required
          //         />
          //       </div>

          //       {/* Account */}
          //       <div>
          //         <label className="block text-sm font-medium text-gray-200">Account</label>
          //         <input
          //           type="text"
          //           name="account"
          //           value={formData.account}
          //           onChange={handleInputChange}
          //           placeholder="e.g. Checking, Savings"
          //           className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          //           required
          //         />
          //       </div>

          //       <div className="flex gap-3 pt-2">
          //         <button
          //           type="submit"
          //           disabled={isSubmitting}
          //           className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          //         >
          //           {isSubmitting ? (
          //             <>
          //               <FaSpinner className="animate-spin" /> Saving...
          //             </>
          //           ) : (
          //             editingId ? 'Update' : 'Create'
          //           )}
          //         </button>
          //         <button
          //           type="button"
          //           onClick={() => {
          //             setShowForm(false);
          //             resetForm();
          //           }}
          //           className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
          //         >
          //           Cancel
          //         </button>
          //       </div>
          //     </form>
          //   </div>
          // </div>
          <IncomeForm
            setIncomes={setIncomes}
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