import { useState } from 'react';
import { FaTrash, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

import useAccountStore from '../store/useAccountStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';

const DeleteAccountSection = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUserAccount = useAccountStore((state) => state.deleteUserAccount);
  const logout = useAuthStore((state) => state.logout);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setConfirmText('');
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== 'CONFIRM') return;
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      toast.success('Account permanently deleted.');
      setShowConfirmation(false);
      setConfirmText('');
      await logout();
    } catch (error) {
      console.error('Error deleting user account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Danger Zone Card */}
      <div className="bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/35 rounded-2xl p-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <FaShieldAlt size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-400 tracking-tight">Danger Zone</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                Permanently delete your account, transaction histories, saving goals, and all linked bank accounts. This action is irreversible.
              </p>
            </div>
          </div>

          <button
            onClick={handleDeleteClick}
            className="self-start sm:self-center bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm shrink-0"
          >
            <FaTrash size={12} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1e252e] border border-rose-500/30 rounded-2xl shadow-2xl shadow-rose-950/30 w-full max-w-md p-6 relative">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 transition-colors"
            >
              <MdClose size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl mb-3">
                <FaExclamationTriangle />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Delete Account Permanently</h3>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure? All your financial data will be permanently wiped out.
              </p>
            </div>

            <div className="bg-[#161c24] p-3.5 rounded-xl border border-white/5 mb-4">
              <p className="text-xs text-gray-300 text-center mb-2">
                Type <span className="font-mono font-extrabold text-rose-400 tracking-wider">CONFIRM</span> to authenticate deletion
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type CONFIRM"
                className="w-full text-center font-mono font-bold tracking-widest px-3 py-2 bg-[#1e252e] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-gray-600 transition"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition bg-gray-800 hover:bg-gray-700 rounded-xl border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmText !== 'CONFIRM' || isDeleting}
                className={`px-5 py-2 rounded-xl flex items-center gap-2 transition text-xs font-semibold ${
                  confirmText === 'CONFIRM' && !isDeleting
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-rose-950/40 text-gray-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <FaTrash size={12} />
                <span>{isDeleting ? 'Deleting...' : 'Delete My Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountSection;