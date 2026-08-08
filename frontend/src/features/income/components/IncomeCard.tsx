// IncomeCard.tsx
import { FaEdit, FaTrash } from "react-icons/fa";

const IncomeCard = ({ income, onEdit, onDelete }: { income: any; onEdit: () => void; onDelete: () => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-3 sm:px-4 hover:bg-[#252e3a] transition-all duration-200 border-b border-white/5 last:border-b-0 group gap-2 sm:gap-0">
    
    {/* Left side - Source and Account */}
    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
      <div className="min-w-[80px] sm:min-w-[100px] shrink-0">
        <p className="text-white font-medium text-xs sm:text-sm truncate">{income.source}</p>
        <p className="text-gray-400 text-xs truncate">{income.account}</p>
      </div>
    </div>

    {/* Description */}
    <div className="flex-1 min-w-0">
      <p className="text-gray-400 text-xs sm:text-sm text-center truncate">
        {income.description || "—"}
      </p>
    </div>

    {/* Middle - Amount */}
    <div className="flex-1 text-center">
      <p className="text-green-500 font-semibold text-sm sm:text-base">
        Rs {income.amount}
      </p>
    </div>

    {/* Right side - Date and Actions */}
    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-1">
      <span className="text-gray-400 text-xs whitespace-nowrap">
        {new Date(income.date).toLocaleDateString()}
      </span>

      {/* Action buttons */}
      <div className="flex gap-1 flex-shrink-0">
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

export default IncomeCard;