import { useState } from 'react';
import { FaPiggyBank, FaTimes, FaCheck, FaFire, FaTrophy, FaCoins } from 'react-icons/fa';
import { RiBankCardLine } from 'react-icons/ri';
import type { SavingGoal } from '../types/saving.type';
import useAccountStore from '../../account/store/useAccountStore';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingGoal | null;
  onContribute: (goalId: number, amount: number, accountId?: number) => Promise<void>;
}

const ContributeModal = ({ isOpen, onClose, goal, onContribute }: ContributeModalProps) => {
  const bankAccounts = useAccountStore((s) => s.bankAccounts);
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const target = Number(goal.target_amount);
  const current = Number(goal.current_amount);
  const remaining = Math.max(0, target - current);
  const enteredAmount = Number(amountStr) || 0;
  const newTotal = current + enteredAmount;
  const currentPct = target > 0 ? (current / target) * 100 : 0;
  const newPct = target > 0 ? Math.min(100, (newTotal / target) * 100) : 0;

  const willReach90 = currentPct < 90 && newPct >= 90 && newPct < 100;
  const willComplete = currentPct < 100 && newPct >= 100;

  const handlePreset = (addAmt: number) => {
    setAmountStr(String(addAmt));
    setError(null);
  };

  const handleFullRemaining = () => {
    setAmountStr(String(remaining));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAmount <= 0) {
      setError('Please enter a valid contribution amount greater than ₹0.');
      return;
    }

    if (selectedAccountId) {
      const chosen = bankAccounts.find((a) => a.id === selectedAccountId);
      if (chosen && Number(chosen.balance) < enteredAmount) {
        setError(`Insufficient funds in ${chosen.bank_name}. Current balance: ₹${Number(chosen.balance).toLocaleString('en-IN')}`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onContribute(goal.id, enteredAmount, selectedAccountId);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to contribute to goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1a2128] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#161c24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FaPiggyBank size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Contribute to Goal</h2>
              <p className="text-xs text-gray-400 truncate max-w-[280px] sm:max-w-xs">{goal.goal_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Goal Progress Summary */}
          <div className="bg-[#12171e] rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Current Progress</span>
              <span className="font-semibold text-gray-200">
                ₹{current.toLocaleString('en-IN')} / ₹{target.toLocaleString('en-IN')} ({currentPct.toFixed(1)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${currentPct}%` }}
              />
              {enteredAmount > 0 && (
                <div
                  className="absolute top-0 bottom-0 bg-emerald-400/80 transition-all duration-300"
                  style={{
                    left: `${currentPct}%`,
                    width: `${Math.max(0, Math.min(100 - currentPct, newPct - currentPct))}%`,
                  }}
                />
              )}
            </div>

            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
              {enteredAmount > 0 && (
                <span className="text-emerald-400 font-medium">
                  → New: ₹{newTotal.toLocaleString('en-IN')} ({newPct.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>

          {/* Milestone Badges */}
          {willComplete && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-pulse">
              <FaTrophy className="text-emerald-400 text-base shrink-0" />
              <span>
                <strong>Goal Completion!</strong> This contribution will complete 100% of this goal.
              </span>
            </div>
          )}

          {willReach90 && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
              <FaFire className="text-amber-400 text-base shrink-0" />
              <span>
                <strong>Milestone Alert!</strong> This contribution will cross 90% of your target.
              </span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Contribution Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 1000"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError(null);
                }}
                className="w-full bg-[#12171e] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[500, 1000, 2000, 5000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-medium border border-white/5 transition-all"
                >
                  +₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={handleFullRemaining}
                  className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 rounded-lg text-xs font-medium border border-purple-500/30 transition-all flex items-center gap-1"
                >
                  <FaCoins size={10} /> Full ₹{remaining.toLocaleString('en-IN')}
                </button>
              )}
            </div>
          </div>

          {/* Source Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <RiBankCardLine className="text-emerald-400" />
              <span>Fund from Bank Account (Optional)</span>
            </label>
            <select
              value={selectedAccountId ?? ''}
              onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#12171e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">Direct Cash / External Savings</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bank_name} ({acc.account_number}) — Balance: ₹{Number(acc.balance).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">
              Selecting a bank account will automatically deduct this contribution amount from its balance.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || enteredAmount <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaCheck size={12} />
              {isSubmitting ? 'Contributing...' : `Contribute ₹${enteredAmount.toLocaleString('en-IN')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;
