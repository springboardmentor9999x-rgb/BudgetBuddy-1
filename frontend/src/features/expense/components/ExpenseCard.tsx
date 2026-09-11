import { FaEdit, FaTrash } from "react-icons/fa";
import type { Expense } from "../types/expense.type";

type ExpenseCardProps = {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
};

const ExpenseCard = ({ expense, onEdit, onDelete }: ExpenseCardProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-3 sm:px-4 hover:bg-red-500/10 hover:cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0 group gap-2 sm:gap-0">

    {/* Left side - Category and Description */}
    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
      <div className="min-w-20 sm:min-w-25 shrink-0">
        <span className="text-slate-800 font-medium text-xs sm:text-sm bg-orange-400 px-2 py-1 rounded-lg whitespace-nowrap">
          {expense.category}
        </span>
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs sm:text-sm truncate">
          {expense.description || "—"}
        </p>
      </div>
    </div>

    {/* Middle - Amount and Account */}
    <div className="flex items-center sm:flex-col sm:items-center justify-between sm:justify-center flex-1 gap-1 sm:gap-0">
      <p className="text-red-400 font-semibold text-sm sm:text-base">
        Rs {expense.amount}
      </p>
      <p className="text-gray-400 text-xs">Account: {expense.account}</p>
    </div>

    {/* Right side - Date and Actions */}
    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 flex-1">
      <span className="text-gray-400 text-xs whitespace-nowrap">
        {new Date(expense.date).toLocaleDateString()}
      </span>

      {/* Action buttons */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition hover:cursor-pointer"
          aria-label="Edit"
        >
          <span className="text-[14px] md:text-[15px]"> <FaEdit /></span>

        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition hover:cursor-pointer"
          aria-label="Delete"
        >
          <span className="text-[14px] md:text-[15px]"> <FaTrash /></span>
        </button>
      </div>
    </div>
  </div>
);

export default ExpenseCard;