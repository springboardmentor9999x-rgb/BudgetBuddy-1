import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
// import { api } from "../../api/api";

import useExpenseStore from "../hooks/useExpenseStore";

import type { ExpenseCreate } from "../types/expense.type";

type ExpenseFormProps = {
  formData: ExpenseCreate,
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<ExpenseCreate>>,
  resetForm: () => void,
  editingId: number | null,
};

const ExpenseForm = ({  setShowForm, setFormData, resetForm, editingId, formData }: ExpenseFormProps) => {

  const { addNewExpense, updateExistingExpense } = useExpenseStore();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // date
  if (formData.date) {
    formData.date = new Date(formData.date).toISOString().split('T')[0];
  }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare payload – convert date to ISO string (matching API example)
      const payload = {
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: new Date(formData.date).toISOString(), // e.g. "2026-08-06T11:20:48.933Z"
        account: formData.account,
      };

      if (editingId !== null) {
        // ─── UPDATE ──────
        await updateExistingExpense(editingId, payload);

      } else {
        // ─── CREATE ──────
        await addNewExpense(payload);
      }
      toast.success(`Expense ${editingId ? 'updated' : 'added'} successfully!`);
      // Close form and reset
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="background-color rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/10">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          {editingId ? 'Edit Expense' : 'New Expense'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g. Groceries"
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Amount (Rs.)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description"
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none scheme-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Account</label>
            <input
              type="text"
              name="account"
              value={formData.account}
              onChange={handleInputChange}
              placeholder="e.g. Savings"
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                editingId ? 'Update' : 'Create'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm