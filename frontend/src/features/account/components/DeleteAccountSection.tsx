import { useState } from 'react';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';


const DeleteAccountSection = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setConfirmText(''); // reset input each time modal opens
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText('');
  };

  const handleConfirmDelete = () => {
    if (confirmText === 'CONFIRM') {
      // onDelete(); // Your logic will go here
      setShowConfirmation(false);
      setConfirmText('');
    }
  };

  return (
    <>
      {/* Danger Zone Card */}
      <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Delete Zone</h2>
        <p className="text-gray-400 text-sm mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteClick}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaTrash />
          Delete Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="inset-bg-blur"> {/* Using custom utility */ }
          <div className="bg-[#1e252e] border-2 border-red-500/15 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
            {/* Close button (optional) */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <MdClose size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <FaExclamationTriangle className="text-red-400 text-4xl mb-3" />
              <h3 className="text-xl font-semibold text-red-400">Delete Account</h3>
            </div>

            <p className="text-gray-300 text-sm mb-4 text-center">
              Please type <span className="font-mono font-bold text-red-400">CONFIRM</span> to proceed.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type CONFIRM"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/80 placeholder-gray-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition bg-gray-100/5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmText !== 'CONFIRM'}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 transition text-sm ${
                  confirmText === 'CONFIRM'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-700/40 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaTrash size={14} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountSection;