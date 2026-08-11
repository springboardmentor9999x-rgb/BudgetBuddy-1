// EditProfileForm.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';

import useAccountStore from '../store/useAccountStore.ts';
import type { UpdateUserProfile } from '../types/account.type.ts';
import { FaMoneyBillWave, FaUser } from 'react-icons/fa';
import { RiEditLine } from 'react-icons/ri';

type EditProfileFormProps = {
  user: UpdateUserProfile;
  onCancel: () => void;
};


const EditProfileForm = ({ user, onCancel }: EditProfileFormProps) => {

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthly_income || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the update function from your store (if available)
  const updateUser = useAccountStore((state) => state.updateUserProfile);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic validation
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
      // Call your store action or API
      await updateUser({
        full_name: fullName.trim(),
        monthly_income: Number(monthlyIncome),
      });
      toast.success('Profile updated successfully');
      onCancel(); // Close the edit form after successful submission
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-lg border border-white/5 p-4 md:p-6 mb-6">
      {/* Header with edit icon */}
      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-200 mb-4">
        <RiEditLine className="text-purple-400" />
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name with icon */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Monthly Income with icon */}
        <div>
          <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-300 mb-1">
            Monthly Income (Rs)
          </label>
          <div className="relative">
            <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="number"
              id="monthlyIncome"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="e.g., 5000"
              required
              min="0"
              step="0.01"
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-white font-medium transition"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 font-medium transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;