import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaSpinner,
  FaTag,
  FaMoneyBillWave,
  FaAlignLeft,
  FaCalendarAlt,
  FaWallet,
  FaTimes,
  FaPlus,
  FaEdit,
} from "react-icons/fa";

import useExpenseStore from "../store/useExpenseStore.ts";
import type { ExpenseCreate } from "../types/expense.type";

type ExpenseFormProps = {
  formData: ExpenseCreate;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<ExpenseCreate>>;
  resetForm: () => void;
  editingId: number | null;
};

// Predefined categories – extend this list as needed
const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Other",
];

const ExpenseForm = ({
  setShowForm,
  setFormData,
  resetForm,
  editingId,
  formData,
}: ExpenseFormProps) => {

  // store hooks for adding and updating expenses
  const addNewExpense = useExpenseStore((state) => state.addNewExpense);
  const updateExistingExpense = useExpenseStore(
    (state) => state.updateExistingExpense
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Normalize date for display (keeps existing behavior)
  if (formData.date) {
    formData.date = new Date(formData.date).toISOString().split("T")[0];
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        account: formData.account,
      };
      // update or create based on editingId
      if (editingId !== null) {
        await updateExistingExpense(editingId, payload);
      } else {
        await addNewExpense(payload);
      }

      toast.success(`Expense ${editingId ? "updated" : "added"} successfully!`);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Failed to save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Dark dropdown styles – applies only inside this component */}
      <style>{`
        .dark-select option {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        .dark-select option:hover,
        .dark-select option:focus,
        .dark-select option:checked {
          background-color: #4b5563 !important;
          color: white !important;
        }
        .dark-select {
          background-color: #1f2937;
          color: #f3f4f6;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
        <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/10">
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              {editingId ? (
                <FaEdit className="text-purple-400 text-xl" />
              ) : (
                <FaPlus className="text-purple-400 text-xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {editingId ? "Edit Expense" : "New Expense"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category – Select */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaTag className="inline mr-2 text-purple-400" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="dark-select w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaMoneyBillWave className="inline mr-2 text-purple-400" />
                Amount (Rs.)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaAlignLeft className="inline mr-2 text-purple-400" />
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaCalendarAlt className="inline mr-2 text-purple-400" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500 scheme-dark"
                required
              />
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaWallet className="inline mr-2 text-purple-400" />
                Account
              </label>
              <input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
                placeholder="e.g. Savings"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <>
                        <FaEdit /> Update
                      </>
                    ) : (
                      <>
                        <FaPlus /> Create
                      </>
                    )}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ExpenseForm;