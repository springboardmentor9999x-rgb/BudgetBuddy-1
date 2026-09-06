import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { ExpenseCategory, IncomeSource, ExpenseItem, IncomeItem } from '../types/budget';
import { EXPENSE_CATEGORIES_META, INCOME_SOURCES, formatMoney } from '../data/categories';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'expense' | 'income';
  editItem?: { type: 'expense'; data: ExpenseItem } | { type: 'income'; data: IncomeItem } | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editItem = null,
}) => {
  const { addExpense, updateExpense, addIncome, updateIncome, user, selectedMonth } = useBudget();

  const [txType, setTxType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [source, setSource] = useState<IncomeSource>('Salary / Wages');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem['paymentMethod']>('UPI / Card');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (editItem) {
        setTxType(editItem.type);
        setAmount(String(editItem.data.amount));
        setDescription(editItem.data.description);
        setDate(editItem.data.date);
        setNotes(editItem.data.notes || '');

        if (editItem.type === 'expense') {
          const exp = editItem.data as ExpenseItem;
          setCategory(exp.category);
          setPaymentMethod(exp.paymentMethod || 'UPI / Card');
        } else {
          const inc = editItem.data as IncomeItem;
          setSource(inc.source);
          setIsRecurring(inc.isRecurring ?? false);
        }
      } else {
        setTxType(initialType);
        setAmount('');
        setDescription('');
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr.startsWith(selectedMonth)) {
          setDate(todayStr);
        } else {
          setDate(`${selectedMonth}-01`);
        }
        setNotes('');
        setCategory('Food & Dining');
        setSource('Salary / Wages');
        setPaymentMethod('UPI / Card');
        setIsRecurring(false);
      }
    }
  }, [isOpen, editItem, initialType, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive number for the amount.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    if (!date) {
      setError('Transaction date is required.');
      return;
    }

    if (txType === 'expense') {
      if (editItem && editItem.type === 'expense') {
        updateExpense(editItem.data.id, {
          amount: numAmount,
          description: description.trim(),
          category,
          date,
          paymentMethod,
          notes: notes.trim(),
        });
      } else {
        addExpense({
          amount: numAmount,
          description: description.trim(),
          category,
          date,
          paymentMethod,
          notes: notes.trim(),
        });
      }
    } else {
      if (editItem && editItem.type === 'income') {
        updateIncome(editItem.data.id, {
          amount: numAmount,
          description: description.trim(),
          source,
          date,
          isRecurring,
          notes: notes.trim(),
        });
      } else {
        addIncome({
          amount: numAmount,
          description: description.trim(),
          source,
          date,
          isRecurring,
          notes: notes.trim(),
        });
      }
    }

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
              <span className={`text-[10px] font-mono-code uppercase tracking-wider font-semibold ${txType === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {txType === 'expense' ? 'Expense Journal' : 'Inflow Journal'}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
              {editItem
                ? `Edit ${editItem.type === 'expense' ? 'Outflow' : 'Inflow'}`
                : `New ${txType === 'expense' ? 'Expense' : 'Income'} Entry`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Type Toggle if not editing */}
          {!editItem && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTxType('expense')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  txType === 'expense'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Outflow (Expense)</span>
              </button>
              <button
                type="button"
                onClick={() => setTxType('income')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  txType === 'income'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Inflow (Income)</span>
              </button>
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Amount ({user.currency})</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 glass-input font-mono-code text-xl sm:text-2xl font-bold text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Description / Payee / Source</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery Store, Client Retainer, Uber"
              className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm"
            />
          </div>

          {/* Category or Source */}
          {txType === 'expense' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
                >
                  <option value="UPI / Card" className="bg-slate-900 text-slate-200">UPI / Card</option>
                  <option value="Credit Card" className="bg-slate-900 text-slate-200">Credit Card</option>
                  <option value="Cash" className="bg-slate-900 text-slate-200">Cash</option>
                  <option value="Bank Transfer" className="bg-slate-900 text-slate-200">Bank Transfer</option>
                  <option value="Digital Wallet" className="bg-slate-900 text-slate-200">Digital Wallet</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Inflow Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as IncomeSource)}
                className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
              >
                {INCOME_SOURCES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-200">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Transaction Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm font-mono-code"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Notes / Reference (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Invoice #2026-89, split with team"
              className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm"
            />
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
              className={`${txType === 'expense' ? 'btn-primary-gradient' : 'btn-emerald-gradient'} text-xs sm:text-sm py-2 px-5 cursor-pointer flex items-center gap-1.5`}
            >
              <Check className="w-4 h-4" />
              <span>{editItem ? 'Save Updates' : 'Commit Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

