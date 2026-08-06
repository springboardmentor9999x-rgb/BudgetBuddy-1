import { useState, useEffect } from 'react';
import { FaUserCircle, FaTrash, FaSpinner } from 'react-icons/fa';

import { api } from '../../api/api';


type UserProfile = {
  full_name: string;
  monthly_income: number;
  currency: string;
};

type User = {
  email: string;
  role: string;
  profile: UserProfile | null;
};

const AccountPage = () => {
  // ─── State ──────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Fetch user data ────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        console.log('User data fetched:', response.data);
        setUser(response.data); // ✅ response.data is the user object
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Could not load account details. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ─── Loading & Error states ─────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <FaSpinner className="text-purple-500 text-4xl animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 text-red-400 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-gray-400 text-center py-12">
        No user data available.
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  const { email, role, profile } = user;
  const { full_name, monthly_income, currency } = profile || {};

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 ">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <FaUserCircle className="text-6xl text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-200">Account</h1>
          <p className="text-gray-400">Manage your profile and settings</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#1e252e] rounded-2xl shadow-lg border border-white/5 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <p className="text-lg text-gray-200 font-medium">{full_name || '—'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <p className="text-lg text-gray-200 font-medium">{email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <p className="text-lg text-gray-200 font-medium capitalize">{role}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monthly Income</label>
            <p className="text-lg text-gray-200 font-medium">
              {currency} {monthly_income?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-gray-400 text-sm mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => console.log("working on this")}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaTrash /> Delete Account
        </button>
      </div>
    </div>
  );
};

export default AccountPage;