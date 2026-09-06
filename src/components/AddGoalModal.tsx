import React, { useState, useEffect } from 'react';
import { X, Check, Target, DollarSign, Calendar, Palette } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { SavingsGoal } from '../types/budget';
import { CURRENCIES } from '../data/categories';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal: SavingsGoal | null;
}

const THEMES = ['emerald', 'indigo', 'rose', 'amber', 'cyan', 'violet'];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  editGoal,
}) => {
  const { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, user } = useBudget();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [colorTheme, setColorTheme] = useState('emerald');

  useEffect(() => {
    if (isOpen) {
      if (editGoal) {
        setTitle(editGoal.title);
        setTargetAmount(String(editGoal.targetAmount));
        setCurrentAmount(String(editGoal.currentAmount));
        setDeadlineDate(editGoal.deadlineDate);
        setColorTheme(editGoal.colorTheme);
      } else {
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadlineDate(new Date().toISOString().split('T')[0]);
        setColorTheme('emerald');
      }
    }
  }, [isOpen, editGoal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editGoal) {
      updateSavingsGoal(editGoal.id, {
        title,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
        deadlineDate,
        colorTheme,
      });
    } else {
      addSavingsGoal({
        title,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
        deadlineDate,
        colorTheme,
      });
    }
    onClose();
  };

  const currencySymbol = CURRENCIES[user.currency]?.symbol || user.currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-card w-full max-w-md shadow-2xl border-slate-800 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-indigo-400 font-semibold">
                Savings
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
              {editGoal ? 'Edit Goal' : 'New Savings Goal'}
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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 glass-input text-sm"
              placeholder="e.g. New Car, Emergency Fund"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 glass-input font-mono-code text-white text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                Current Saved
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 glass-input font-mono-code text-white text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Target Date
            </label>
            <input
              type="date"
              required
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full px-4 py-2.5 glass-input text-sm cursor-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              Color Theme
            </label>
            <div className="flex gap-2 items-center flex-wrap mt-1">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setColorTheme(theme)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    theme === 'emerald' ? 'bg-emerald-500' :
                    theme === 'indigo' ? 'bg-indigo-500' :
                    theme === 'rose' ? 'bg-rose-500' :
                    theme === 'amber' ? 'bg-amber-500' :
                    theme === 'cyan' ? 'bg-cyan-500' :
                    theme === 'violet' ? 'bg-violet-500' : ''
                  } ${colorTheme === theme ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-800/80">
            {editGoal ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this goal?')) {
                    deleteSavingsGoal(editGoal.id);
                    onClose();
                  }
                }}
                className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer px-2"
              >
                Delete Goal
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <div className="flex items-center gap-3">
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
                <span>{editGoal ? 'Save' : 'Add'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
