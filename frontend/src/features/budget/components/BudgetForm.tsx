import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaTimes,
  FaPlus,
  FaEdit,
  FaTag,
  FaMoneyBillWave,
  FaSpinner,
} from 'react-icons/fa';
import useBudgetStore from '../store/useBudgetStore';
import type { Budget, BudgetCreate } from '../types/budget.type';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Bills', 'Healthcare', 'Education', 'Other',
];

interface BudgetFormProps {
  editingBudget: Budget | null;
  formData: BudgetCreate;
  setFormData: React.Dispatch<React.SetStateAction<BudgetCreate>>;
  onClose: () => void;
}

const BudgetForm = ({ editingBudget, formData, setFormData, onClose }: BudgetFormProps) => {
  const { addBudget, updateBudget } = useBudgetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Number(formData.monthly_limit) <= 0) {
      toast.error('Monthly limit must be greater than 0.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: BudgetCreate = {
        category: formData.category,
        monthly_limit: Number(formData.monthly_limit),
        created_at: new Date().toISOString(),
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, { category: payload.category, monthly_limit: payload.monthly_limit });
        toast.success('Budget updated!');
      } else {
        await addBudget(payload);
        toast.success('Budget created!');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .dark-select option { background-color: #1f2937 !important; color: #f3f4f6 !important; }
        .dark-select { background-color: #1f2937; color: #f3f4f6; }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-white/10 animate-fadeIn">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-600/20 rounded-lg">
              {editingBudget ? (
                <FaEdit className="text-cyan-400 text-xl" />
              ) : (
                <FaPlus className="text-cyan-400 text-xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {editingBudget ? 'Edit Budget' : 'New Budget'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaTag className="inline mr-2 text-cyan-400" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="dark-select w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-white transition"
                required
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Monthly Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaMoneyBillWave className="inline mr-2 text-cyan-400" />
                Monthly Limit (₹)
              </label>
              <input
                type="number"
                name="monthly_limit"
                value={formData.monthly_limit}
                onChange={handleChange}
                placeholder="10000"
                min="1"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-white transition placeholder-gray-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                {isSubmitting ? (
                  <><FaSpinner className="animate-spin" /> Saving...</>
                ) : editingBudget ? (
                  <><FaEdit /> Update</>
                ) : (
                  <><FaPlus /> Create</>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
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

export default BudgetForm;
