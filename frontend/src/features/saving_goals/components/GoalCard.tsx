import { FaEdit, FaTrash, FaFlag, FaTrophy, FaFire, FaPlusCircle } from 'react-icons/fa';
import type { SavingGoal } from '../types/saving.type';

interface GoalCardProps {
  goal: SavingGoal;
  effectiveSaved?: number;
  fromPool?: number;
  isShortestDate?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onContribute?: () => void;
}

const progressColor = (pct: number) => {
  if (pct >= 100) return 'from-emerald-400 to-teal-400';
  if (pct >= 75) return 'from-cyan-400 to-blue-500';
  if (pct >= 50) return 'from-amber-400 to-orange-500';
  return 'from-purple-500 to-pink-500';
};

const daysLeft = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

const GoalCard = ({ goal, effectiveSaved, fromPool, isShortestDate, onEdit, onDelete, onComplete, onContribute }: GoalCardProps) => {
  const target = Number(goal.target_amount);
  const current = effectiveSaved !== undefined ? effectiveSaved : Number(goal.current_amount);
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const remaining = Math.max(0, target - current);
  const days = daysLeft(goal.target_date);
  const isComplete = pct >= 100;

  return (
    <div className={`relative group bg-[#1e252e] rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between
      ${isComplete
        ? 'border-emerald-500/40 shadow-[0_0_24px_rgba(52,211,153,0.12)]'
        : isShortestDate
          ? 'border-purple-500/50 shadow-[0_0_24px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
          : 'border-white/5 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]'
      }`}
    >
      {/* Ribbons */}
      {isComplete ? (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <FaTrophy size={9} /> COMPLETED
        </div>
      ) : isShortestDate ? (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
          ⚡ SHORTEST DATE (PRIORITY 1)
        </div>
      ) : null}

      <div className="p-5">
        {/* Goal name & icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${isComplete ? 'bg-emerald-500/15' : 'bg-purple-500/15'} shrink-0`}>
            {isComplete ? (
              <FaTrophy className="text-emerald-400 text-lg" />
            ) : (
              <FaFlag className="text-purple-400 text-lg" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base truncate leading-tight">{goal.goal_name}</h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Target: {new Date(goal.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Funded from savings pool badge */}
        {fromPool !== undefined && fromPool > 0 && !isComplete && (
          <div className="text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg mb-3 flex items-center justify-between font-medium">
            <span>⚡ Funded from Bank Savings</span>
            <span className="font-bold">₹{fromPool.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-400">Progress</span>
            <span className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor(pct)} transition-all duration-700 ease-out relative`}
              style={{ width: `${pct}%` }}
            >
              {pct > 10 && (
                <span className="absolute inset-0 rounded-full animate-pulse opacity-40 bg-white/20" />
              )}
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/3 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Saved</p>
            <p className="text-sm font-bold text-emerald-400">₹{current.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/3 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Target</p>
            <p className="text-sm font-bold text-white">₹{target.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/3 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Left</p>
            <p className={`text-sm font-bold ${isComplete ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isComplete ? '—' : `₹${remaining.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>

        {/* Days left chip */}
        {!isComplete && (
          <div className={`flex items-center gap-1.5 text-xs mb-2 ${days <= 7 ? 'text-amber-400' : 'text-gray-500'}`}>
            {days <= 7 && <FaFire size={11} />}
            <span>{days === 0 ? 'Deadline today!' : `${days} day${days !== 1 ? 's' : ''} remaining`}</span>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-5 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          {!isComplete && onContribute && (
            <button
              onClick={onContribute}
              className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-purple-600/25 border border-purple-500/40 hover:bg-purple-600/40 text-purple-200 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md"
            >
              <FaPlusCircle size={12} className="text-purple-400" /> Contribute
            </button>
          )}

          {!isComplete && (
            <button
              onClick={onComplete}
              className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-200 shadow-lg shadow-emerald-900/20"
            >
              ✓ Complete
            </button>
          )}

          <button
            onClick={onEdit}
            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200"
            aria-label="Edit"
            title="Edit Goal"
          >
            <FaEdit size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            aria-label="Delete"
            title="Delete Goal"
          >
            <FaTrash size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;

