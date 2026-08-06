import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { api } from "../../api/api";
import { useState } from "react";


type IncomeFormProps = {
  setIncomes: React.Dispatch<React.SetStateAction<any[]>>,
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<{
    source: string;
    amount: string;
    date: string;
    account: string;
  }>>,
  resetForm: () => void,
  editingId: number | null,
  formData: {
    source: string;
    amount: string;
    date: string;
    account: string;
  }
};

const IncomeForm = ({setIncomes, setShowForm, setFormData, resetForm, editingId, formData}: IncomeFormProps) => {
  // const [showForm, setShowForm] = useState(false);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // date 
  formData.date =  new Date(formData.date).toISOString().split('T')[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build payload – API expects: source, amount, date (ISO)
      const payload = {
        source: formData.source,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(), // always ISO for both
      };

      if (editingId !== null) {
        // ─── UPDATE ──────────────────────────────────────────
        const response = await api.put(
          `/incomes/income/${editingId}`,
          payload
        );
        const updatedIncome = response.data;
        setIncomes((prev) =>
          prev.map((inc) =>
            inc.id === editingId
              ? { ...inc, ...updatedIncome, account: inc.account } // preserve account
              : inc
          )
        );
        toast.success('Income updated successfully!');
      } else {
        // ─── CREATE ──────────────────────────────────────────
        const response = await api.post('/incomes/add-income', payload);
        const newIncome = response.data; // API should return full object with id
        setIncomes((prev) => [...prev, newIncome]);
        toast.success('Income added successfully!');
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Failed to save income.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="background-color rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/10">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          {editingId ? 'Edit Income' : 'New Income'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-200">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              placeholder="e.g. Salary, Freelance"
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          {/* Amount */}
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

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-200">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-200">Account</label>
            <input
              type="text"
              name="account"
              value={formData.account}
              onChange={handleInputChange}
              placeholder="e.g. Checking, Savings"
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

export default IncomeForm