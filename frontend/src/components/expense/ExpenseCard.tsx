import { FaEdit, FaTrash } from "react-icons/fa";

type ExpenseCardProps = {
  expense: {
    id: number;
    category: string;
    amount: number;
    description: string;
    date: string;
  };
  onEdit: () => void;
  onDelete: () => void;
};

const ExpenseCard = ({ expense, onEdit, onDelete }: ExpenseCardProps) => (
  <div className="bg-[#1e252e] rounded-xl shadow-md p-5 hover:shadow-lg transition flex flex-col justify-between border border-white/5">
    <div>
      <div className="flex justify-between items-start">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
          {expense.category}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700 transition p-1"
            aria-label="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 transition p-1"
            aria-label="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-200 mt-2">
        Rs {expense.amount.toFixed(2)}
      </p>
      <p className="text-gray-300 mt-1">{expense.description}</p>
    </div>
    <div className="mt-4 text-sm text-gray-400 border-t pt-2 flex justify-between">
      <span>{new Date(expense.date).toLocaleDateString()}</span>
    </div>
  </div>
);

export default ExpenseCard;