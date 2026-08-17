import { FaEdit, FaTrash, FaWallet, FaExclamationTriangle } from 'react-icons/fa';
import type { Budget } from '../types/budget.type';

interface BudgetCardProps {
  budget: Budget;
  spent: number; // total expenses in this category this month
  onEdit: () => void;
  onDelete: () => void;
}

const progressColor = (pct: number) => {
  if (pct >= 100) return 'from-red-500 to-rose-600';
  if (pct >= 80) return 'from-amber-400 to-orange-500';
  if (pct >= 50) return 'from-yellow-400 to-amber-500';
  return 'from-emerald-400 to-teal-500';
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'text-orange-400 bg-orange-500/10',
  Transport: 'text-sky-400 bg-sky-500/10',
  Shopping: 'text-pink-400 bg-pink-500/10',
  Entertainment: 'text-purple-400 bg-purple-500/10',
  Bills: 'text-amber-400 bg-amber-500/10',
  Healthcare: 'text-red-400 bg-red-500/10',
  Education: 'text-cyan-400 bg-cyan-500/10',
  Other: 'text-gray-400 bg-gray-500/10',
};

const BudgetCard = ({ budget, spent, onEdit, onDelete }: BudgetCardProps) => {
  const limit = Number(budget.monthly_limit);
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const remaining = Math.max(0, limit - spent);
  const isOver = spent > limit;
  const colorClass = CATEGORY_COLORS[budget.category] ?? CATEGORY_COLORS['Other'];

  return (
    <div className={`relative group bg-[#1e252e] rounded-2xl border transition-all duration-300 overflow-hidden
      ${isOver
        ? 'border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.1)]'
        : 'border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.07)]'
      }`}
    >
      {isOver && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <FaExclamationTriangle size={9} /> OVERSPENT
        </div>
      )}

      <div className="p-5">
        {/* Category + Icon */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2.5 rounded-xl shrink-0 ${colorClass.split(' ')[1]}`}>
            <FaWallet className={`text-lg ${colorClass.split(' ')[0]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight">{budget.category}</h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Created: {new Date(budget.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-400">Monthly spend</span>
            <span className={`font-bold ${isOver ? 'text-red-400' : pct >= 80 ? 'text-amber-400' : 'text-white'}`}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor(pct)} transition-all duration-700 ease-out relative`}
              style={{ width: `${pct}%` }}
            >
              {pct > 10 && (
                <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse opacity-30" />
              )}
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/3 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Spent</p>
            <p className={`text-sm font-bold ${isOver ? 'text-red-400' : 'text-white'}`}>
              ₹{spent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white/3 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Limit</p>
            <p className="text-sm font-bold text-cyan-400">₹{limit.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/3 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Left</p>
            <p className={`text-sm font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
              {isOver ? `-₹${(spent - limit).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 text-xs font-semibold py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <FaEdit size={11} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 text-xs font-semibold py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <FaTrash size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
