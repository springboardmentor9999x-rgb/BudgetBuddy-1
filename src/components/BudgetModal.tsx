import React, { useState, useEffect } from 'react';
import { X, Check, Target, Sparkles, AlertTriangle } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { ExpenseCategory } from '../types/budget';
import { EXPENSE_CATEGORIES_META, formatMoney } from '../data/categories';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ExpenseCategory;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  defaultCategory,
}) => {
  const { budgets, setBudgetLimit, user, selectedMonth } = useBudget();
  const [category, setCategory] = useState<ExpenseCategory>(defaultCategory || 'Food & Dining');
  const [limit, setLimit] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(80);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      const targetCat = defaultCategory || 'Food & Dining';
      setCategory(targetCat);

      const existing = budgets.find(
        (b) => b.category === targetCat && (b.monthYear === selectedMonth || !b.monthYear)
      );
      if (existing) {
        setLimit(String(existing.monthlyLimit));
        setThreshold(existing.alertThresholdPercent || 80);
      } else {
        setLimit('5000');
        setThreshold(80);
      }
    }
  }, [isOpen, defaultCategory, budgets, selectedMonth]);

  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    const existing = budgets.find(
      (b) => b.category === newCat && (b.monthYear === selectedMonth || !b.monthYear)
    );
    if (existing) {
      setLimit(String(existing.monthlyLimit));
      setThreshold(existing.alertThresholdPercent || 80);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Please provide a valid positive budget ceiling limit.');
      return;
    }

    setBudgetLimit(category, numLimit, selectedMonth, threshold);
    onClose();
  };

  const categories = Object.keys(EXPENSE_CATEGORIES_META) as ExpenseCategory[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg shadow-2xl border-slate-800 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-indigo-400 font-semibold">
                Allocation Ceilings
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
              Establish Category Cap
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Limit amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Monthly Ceiling Cap ({user.currency})</label>
            <input
              type="number"
              step="any"
              required
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="5000"
              className="w-full px-4 py-3 glass-input font-mono-code text-xl sm:text-2xl font-bold text-white"
            />
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2 pt-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Warning Trigger Buffer</label>
              <span className="font-mono-code text-xs font-bold text-amber-400">{threshold}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Triggers visual amber warning when spending exceeds {threshold}% of the established ceiling.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-glass text-xs sm:text-sm py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-gradient text-xs sm:text-sm py-2 px-5 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Establish Cap</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

