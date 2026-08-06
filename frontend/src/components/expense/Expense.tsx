import { useEffect, useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../api/api';
import ExpenseCard from './ExpenseCard';
import ExpenseForm from './ExpenseForm';
import DeleteConfirm from '../DeleteConfirm';


type ExpensePageProps = {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
};

const ExpensePage = () => {
  // ─── State ──────────────────────────────────────────────
  const [expenses, setExpenses] = useState<ExpensePageProps[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: '',
  });

  // ─── Delete modal state ────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch expenses from API on component mount
    const fetchExpenses = async () => {
      try {
        const response = await api.get('expenses/get-expenses');
        setExpenses(response.data);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
        toast.error('Failed to load expenses.');
      }
    };

    fetchExpenses();
  }, []);
  // ─── Handlers ────────────────────────────────────────────
  // const handleInputChange = (e: any) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const resetForm = () => {
    setFormData({ category: '', amount: '', description: '', date: '' });
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (expense: any) => {
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  // const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     // Prepare payload – convert date to ISO string (matching API example)
  //     const payload = {
  //       category: formData.category,
  //       amount: parseFloat(formData.amount),
  //       description: formData.description,
  //       date: new Date(formData.date).toISOString(), // e.g. "2026-08-06T11:20:48.933Z"
  //     };

  //     if (editingId !== null) {
  //       // ─── EDIT: PUT request with expense_id in path ──────────
  //       const response = await api.put(
  //         `/expenses/update-expense/${editingId}`,
  //         payload
  //       );
  //       // Assume API returns the updated expense object
  //       const updatedExpense = response.data;

  //       // Update local state with the returned data (or merge)
  //       setExpenses((prev) =>
  //         prev.map((exp) =>
  //           exp.id === editingId ? { ...exp, ...updatedExpense } : exp
  //         )
  //       );
  //     } else {
  //       // ─── CREATE ──────────────────────────────────────────────
  //       const response = await api.post('/expenses/add-expense', payload);
  //       // Assume API returns the created expense with an `id`
  //       const newExpense = response.data; // adjust according to your API response structure

  //       setExpenses((prev) => [...prev, newExpense]);
  //     }
  //     toast.success(`Expense ${editingId ? 'updated' : 'added'} successfully!`);
  //     // Close form and reset
  //     setShowForm(false);
  //     resetForm();
  //   } catch (err) {
  //     console.error('API Error:', err);
  //     toast.error('Failed to save expense. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
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
      await api.delete(`/expenses/delete-expense/${deleteId}`);
      // Remove from local state
      setExpenses((prev) => prev.filter((exp) => exp.id !== deleteId));
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

  // const handleDelete = (id: any) => {
  //   if (window.confirm('Are you sure you want to delete this expense?')) {
  //     setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  //   }
  // };

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      <div className="flex h-screen background-color font-sans">
        {/* ─── MAIN CONTENT ──────────────────────────────────── */}
        <main className="flex-1 px-4 md:px-8 py-4 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-200">Expenses</h1>
            <button
              onClick={openCreateForm}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition flex items-center gap-2"
            >
              <FaPlus /> <span className="hidden sm:inline">Add Expense</span>
            </button>
          </div>

          {/* Expense Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-12">
                No expenses yet. Click “Add Expense” to get started.
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
        </main>

        {/* ─── MODAL FORM ────────────────────────────────────── */}
        {showForm && (
          // <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          //   <div className="background-color rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/10">
          //     <h2 className="text-2xl font-bold text-gray-200 mb-4">
          //       {editingId ? 'Edit Expense' : 'New Expense'}
          //     </h2>

          //     <form onSubmit={handleSubmit} className="space-y-4">
          //       <div>
          //         <label className="block text-sm font-medium text-gray-200">Category</label>
          //         <input
          //           type="text"
          //           name="category"
          //           value={formData.category}
          //           onChange={handleInputChange}
          //           placeholder="e.g. Groceries"
          //           className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          //           required
          //         />
          //       </div>

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

          //       <div>
          //         <label className="block text-sm font-medium text-gray-200">Description</label>
          //         <input
          //           type="text"
          //           name="description"
          //           value={formData.description}
          //           onChange={handleInputChange}
          //           placeholder="Brief description"
          //           className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          //           required
          //         />
          //       </div>

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
          <ExpenseForm
            setExpenses={setExpenses}
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