import { useState } from 'react';
import toast from 'react-hot-toast';

import useAccountStore from '../store/useAccountStore.ts';
import type { UpdateUserProfile } from '../types/account.type.ts';
import { FaMoneyBillWave, FaUser, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import { RiEditLine } from 'react-icons/ri';

type EditProfileFormProps = {
  user: UpdateUserProfile;
  onCancel: () => void;
};

const EditProfileForm = ({ user, onCancel }: EditProfileFormProps) => {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthly_income || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUser = useAccountStore((state) => state.updateUserProfile);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!monthlyIncome || Number(monthlyIncome) <= 0) {
      toast.error('Monthly income must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser({
        full_name: fullName.trim(),
        monthly_income: Number(monthlyIncome),
      });
      toast.success('Profile updated successfully! ✨');
      onCancel();
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-xl border border-purple-500/30 p-6 mb-6 relative animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/20 text-purple-400">
            <RiEditLine size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Edit Profile</h2>
            <p className="text-xs text-gray-400">Update your personal details and monthly income</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          type="button"
          className="text-gray-400 hover:text-white p-1 transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name with icon */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full pl-9 pr-4 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-sm text-gray-200 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition"
              />
            </div>
          </div>

          {/* Monthly Income with icon */}
          <div>
            <label htmlFor="monthlyIncome" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Monthly Income (₹)
            </label>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs" />
              <input
                type="number"
                id="monthlyIncome"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g., 50000"
                required
                min="0"
                step="0.01"
                className="w-full pl-9 pr-4 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-sm text-gray-200 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition border border-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition"
          >
            {isSubmitting ? (
              <><FaSpinner className="animate-spin" /> Saving...</>
            ) : (
              <><FaCheck size={12} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;