import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

const DeleteConfirm = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Expense',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  isDeleting = false,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="inset-bg-blur">
      <div className="bg-[#1e252e] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/10 animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-500/20 rounded-full">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
        </div>

        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin">⏳</span> Deleting...
              </>
            ) : (
              'Yes, Delete'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;