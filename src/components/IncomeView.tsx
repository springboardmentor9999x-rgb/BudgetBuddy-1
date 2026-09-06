import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Target,
  Repeat,
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { IncomeSource, IncomeItem } from '../types/budget';
import { INCOME_SOURCES, formatMoney } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { PageHeader } from './PageHeader';

interface IncomeViewProps {
  onOpenAddModal: () => void;
  onEditIncome: (income: IncomeItem) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  onOpenAddModal,
  onEditIncome,
}) => {
  const { filteredIncomes, user, selectedMonth, deleteIncome, exportSingleTransaction, exportIncomesReport } =
    useBudget();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');

  const displayedIncomes = useMemo(() => {
    return filteredIncomes.filter((item) => {
      const matchesSource = selectedSource === 'All' || item.source === selectedSource;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        item.amount.toString().includes(q);

      return matchesSource && matchesSearch;
    });
  }, [filteredIncomes, searchQuery, selectedSource]);

  const totalIncomeAmount = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const goalPercent = user.monthlyIncomeGoal > 0 ? Math.round((totalIncomeAmount / user.monthlyIncomeGoal) * 100) : 0;

  const handleDownloadSingleExcel = (inc: IncomeItem) => {
    exportSingleTransaction({
      id: inc.id,
      type: 'income',
      title: inc.description,
      amount: inc.amount,
      date: inc.date,
      categoryOrSource: inc.source,
      notes: inc.notes,
      status: 'Deposited & Verified',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <PageHeader
        title="Income Streams"
        subtitle={`Manage salaries, investments, client invoices, and recurring inflows for ${selectedMonth}.`}
        onExportExcel={exportIncomesReport}
        primaryAction={
          <button
            onClick={onOpenAddModal}
            className="btn-emerald-gradient text-xs sm:text-sm py-2 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Inflow</span>
          </button>
        }
      />

      {/* Target Progress & Channel Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Milestone Goal Card */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Monthly Target Milestone
              </span>
              <span className="text-xs font-mono-code font-bold text-indigo-400">{goalPercent}%</span>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <h3 className="font-display font-bold text-2xl text-white">
                {formatMoney(totalIncomeAmount, user.currency)}
              </h3>
              <span className="text-xs text-slate-400">
                Target: {formatMoney(user.monthlyIncomeGoal, user.currency)}
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mt-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 shadow-sm shadow-emerald-500/30"
              style={{ width: `${Math.min(100, goalPercent)}%` }}
            />
          </div>
        </div>

        {/* Active Income Channels Card */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Active Inflow Channels
            </span>
            <div className="flex flex-wrap gap-2 mt-3">
              {INCOME_SOURCES.map((source) => {
                const amount = filteredIncomes
                  .filter((i) => i.source === source)
                  .reduce((sum, i) => sum + i.amount, 0);
                if (amount === 0) return null;
                return (
                  <div
                    key={source}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2"
                  >
                    <span className="text-xs text-slate-300 font-medium">{source}:</span>
                    <span className="font-mono-code text-xs font-bold text-emerald-400">
                      +{formatMoney(amount, user.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            {filteredIncomes.filter((i) => i.isRecurring).length} recurring monthly stream(s) established.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search income description, employer, client, source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
          >
            <option value="All">All Inflow Sources</option>
            {INCOME_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Income Table */}
      {displayedIncomes.length === 0 ? (
        <div className="py-20 text-center glass-card border border-dashed border-slate-800">
          <p className="text-slate-400 text-sm">
            No income entries recorded for this period matching criteria.
          </p>
          <button
            onClick={onOpenAddModal}
            className="btn-emerald-gradient mt-4 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Income Inflow</span>
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
                  <th className="py-3.5 px-4">Inflow Source</th>
                  <th className="py-3.5 px-4">Recurrence</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedIncomes.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onEditIncome(inc)}
                  >
                    <td className="py-3.5 px-4 font-mono-code text-xs text-slate-400 whitespace-nowrap">
                      {inc.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <CategoryIcon name={inc.source} className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {inc.description}
                          </div>
                          {inc.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                              {inc.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                        {inc.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-code text-xs text-slate-400 whitespace-nowrap">
                      {inc.isRecurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                          <Repeat className="w-3 h-3" /> Monthly
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">One-off</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-code text-xs sm:text-sm font-bold text-emerald-400 whitespace-nowrap">
                      +{formatMoney(inc.amount, user.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDownloadSingleExcel(inc)}
                          title="Download Excel Receipt (.xls)"
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditIncome(inc)}
                          title="Edit Entry"
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteIncome(inc.id)}
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

