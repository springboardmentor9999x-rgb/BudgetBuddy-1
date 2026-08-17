import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaTimes,
  FaPlus,
  FaEdit,
  FaFlag,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSpinner,
} from 'react-icons/fa';
import useSavingGoalStore from '../store/useSavingGoalStore';
import type { SavingGoal, SavingGoalCreate } from '../types/saving.type';

interface GoalFormProps {
  editingGoal: SavingGoal | null;
  formData: SavingGoalCreate;
  setFormData: React.Dispatch<React.SetStateAction<SavingGoalCreate>>;
  totalUserSavings?: number;
  onClose: () => void;
}

const GoalForm = ({ editingGoal, formData, setFormData, totalUserSavings, onClose }: GoalFormProps) => {
  const { addGoal, updateGoal } = useSavingGoalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetAmt = Number(formData.target_amount);
    const currentAmt = Number(formData.current_amount);

    if (currentAmt > targetAmt) {
      toast.error('Current amount cannot exceed the target amount.');
      return;
    }
    if (new Date(formData.target_date) <= new Date()) {
      toast.error('Target date must be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SavingGoalCreate = {
        goal_name: formData.goal_name,
        target_amount: targetAmt,
        current_amount: currentAmt,
        target_date: formData.target_date,
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, payload);
        toast.success('Saving goal updated!');
      } else {
        await addGoal(payload);
        toast.success('Saving goal created!');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .dark-input { color-scheme: dark; }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-white/10 animate-fadeIn">
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              {editingGoal ? (
                <FaEdit className="text-purple-400 text-xl" />
              ) : (
                <FaPlus className="text-purple-400 text-xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {editingGoal ? 'Edit Goal' : 'New Saving Goal'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Goal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaFlag className="inline mr-2 text-purple-400" />
                Goal Name
              </label>
              <input
                type="text"
                name="goal_name"
                value={formData.goal_name}
                onChange={handleChange}
                placeholder="e.g. Emergency Fund, New Laptop..."
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
                maxLength={100}
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaMoneyBillWave className="inline mr-2 text-purple-400" />
                Target Amount (₹)
              </label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                placeholder="50000"
                min="1"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
              />
            </div>

            {/* Current Amount */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  <FaMoneyBillWave className="inline mr-2 text-emerald-400" />
                  Current Savings (₹)
                </label>
                {totalUserSavings !== undefined && totalUserSavings > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, current_amount: totalUserSavings }))}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
                  >
                    Use Total (₹{totalUserSavings.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
              <input
                type="number"
                name="current_amount"
                value={formData.current_amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition placeholder-gray-500"
                required
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FaCalendarAlt className="inline mr-2 text-purple-400" />
                Target Date
              </label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="dark-input w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white transition"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {isSubmitting ? (
                  <><FaSpinner className="animate-spin" /> Saving...</>
                ) : editingGoal ? (
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

export default GoalForm;
