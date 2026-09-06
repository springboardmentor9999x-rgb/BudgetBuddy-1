import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  FileSpreadsheet,
  ArrowDownLeft,
  Filter,
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { ExpenseCategory, ExpenseItem } from '../types/budget';
import { EXPENSE_CATEGORIES_META, formatMoney } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { PageHeader } from './PageHeader';

interface ExpensesViewProps {
  onOpenAddModal: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenAddModal,
  onEditExpense,
}) => {
  const { filteredExpenses, user, selectedMonth, deleteExpense, exportSingleTransaction, exportExpensesReport } =
    useBudget();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filtered and sorted expenses
  const displayedExpenses = useMemo(() => {
    return filteredExpenses
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'All' || item.category === selectedCategory;
        const matchesPayment =
          selectedPaymentMethod === 'All' || item.paymentMethod === selectedPaymentMethod;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          item.amount.toString().includes(q);

        return matchesCategory && matchesPayment && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [filteredExpenses, searchQuery, selectedCategory, selectedPaymentMethod, sortBy]);

  const totalFilteredAmount = displayedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const categoriesList = Object.keys(EXPENSE_CATEGORIES_META) as ExpenseCategory[];

  const handleDownloadSingleExcel = (exp: ExpenseItem) => {
    exportSingleTransaction({
      id: exp.id,
      type: 'expense',
      title: exp.description,
      amount: exp.amount,
      date: exp.date,
      categoryOrSource: exp.category,
      paymentMode: exp.paymentMethod,
      notes: exp.notes,
      status: 'Settled & Paid',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <PageHeader
        title="Expenses Ledger"
        subtitle={`Track and categorize individual outlays for ${selectedMonth}.`}
        onExportExcel={exportExpensesReport}
        primaryAction={
          <button
            onClick={onOpenAddModal}
            className="btn-primary-gradient text-xs sm:text-sm py-2 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Expense</span>
          </button>
        }
      />

      {/* Category Pills Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Categories ({filteredExpenses.length})
        </button>
        {categoriesList.map((cat) => {
          const count = filteredExpenses.filter((e) => e.category === cat).length;
          if (count === 0 && selectedCategory !== cat) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar: Search, Channel & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description, notes, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
          >
            <option value="All">All Payment Channels</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
            <option value="UPI">UPI / Instant</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Outlay</option>
            <option value="amount-asc">Lowest Outlay</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {displayedExpenses.length === 0 ? (
        <div className="py-20 text-center glass-card border border-dashed border-slate-800">
          <p className="text-slate-400 text-sm">
            No expenses found matching the current search or filters.
          </p>
          <button
            onClick={onOpenAddModal}
            className="btn-primary-gradient mt-4 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Outflow</span>
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-mono-code uppercase text-slate-400 bg-slate-900/60 text-left">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onEditExpense(exp)}
                  >
                    <td className="py-3.5 px-4 font-mono-code text-xs text-slate-400 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                          <CategoryIcon name={exp.category} className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {exp.description}
                          </div>
                          {exp.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                              {exp.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-code text-xs text-slate-400 whitespace-nowrap">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-code text-xs sm:text-sm font-bold text-rose-400 whitespace-nowrap">
                      -{formatMoney(exp.amount, user.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDownloadSingleExcel(exp)}
                          title="Download Excel Voucher Receipt (.xls)"
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditExpense(exp)}
                          title="Edit Entry"
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          title="Delete Entry"
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

