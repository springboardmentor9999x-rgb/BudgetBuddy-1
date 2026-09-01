import React from 'react';
import {
  RiFileExcel2Line,
  RiFilePdfLine,
  RiFilter3Line,
  RiCalendarEventLine,
} from 'react-icons/ri';
import { useReportStore } from '../store/useReportStore.ts';

const MONTH_NAMES = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const PRESETS = [
  { id: 'this_month' as const, label: 'This Month' },
  { id: 'last_month' as const, label: 'Last Month' },
  { id: 'this_year' as const, label: 'This Year' },
  { id: 'last_30_days' as const, label: 'Last 30 Days' },
  { id: 'last_90_days' as const, label: 'Last 90 Days' },
  { id: 'all_time' as const, label: 'All Time' },
];

export const ReportFilters: React.FC = () => {
  const {
    filters,
    setFilter,
    applyPreset,
    fetchReportData,
    exportExcel,
    exportPdf,
    isExportingExcel,
    isExportingPdf,
    isLoading,
    reportData,
  } = useReportStore();

  const availableYears = reportData?.available_years?.length
    ? reportData.available_years
    : [new Date().getFullYear(), new Date().getFullYear() - 1];

  const availableCategories = reportData?.available_categories || [];
  const availableAccounts = reportData?.available_accounts || [];

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchReportData();
  };

  return (
    <div className="bg-[#161c24] border border-white/10 rounded-2xl p-5 mb-6 shadow-xl space-y-5">
      {/* ─── Top Bar: Presets & Action Buttons ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        {/* Preset Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <RiCalendarEventLine className="text-cyan-400" /> Presets:
          </span>
          {PRESETS.map((p) => {
            const isSelected =
              (p.id === 'this_month' && filters.period_type === 'month' && filters.month === new Date().getMonth() + 1 && filters.year === new Date().getFullYear()) ||
              (p.id === 'this_year' && filters.period_type === 'year' && filters.year === new Date().getFullYear()) ||
              (p.id === 'all_time' && filters.period_type === 'all');

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={exportPdf}
            disabled={isExportingPdf || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-100 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:scale-100"
            title="Download Comprehensive PDF Report with Summary & Transactions"
          >
            <RiFilePdfLine className="text-rose-400 text-base" />
            {isExportingPdf ? 'Generating PDF...' : 'Download PDF (.pdf)'}
          </button>

          <button
            type="button"
            onClick={exportExcel}
            disabled={isExportingExcel || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:scale-100"
            title="Download Comprehensive Excel (.xlsx) Report with All Sheets"
          >
            <RiFileExcel2Line className="text-base" />
            {isExportingExcel ? 'Generating Sheet...' : 'Download Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* ─── Filter Form Controls ─── */}
      <form onSubmit={handleApply} className="space-y-4">
        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 mr-2">Filter Mode:</span>
          {(['month', 'year', 'custom', 'all'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setFilter('period_type', type);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filters.period_type === type
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]'
                  : 'bg-[#0f141a] text-gray-400 hover:text-gray-200 border border-white/5'
              }`}
            >
              {type === 'month' && 'Specific Month'}
              {type === 'year' && 'Full Year'}
              {type === 'custom' && 'Custom Date Range'}
              {type === 'all' && 'All-Time Records'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
          {/* Specific Month Selector */}
          {filters.period_type === 'month' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Select Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilter('month', Number(e.target.value))}
                className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m.value} value={m.value} className="bg-[#161c24] text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Selector */}
          {(filters.period_type === 'month' || filters.period_type === 'year') && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Select Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilter('year', Number(e.target.value))}
                className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y} className="bg-[#161c24] text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Date Range Inputs */}
          {filters.period_type === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilter('start_date', e.target.value)}
                  className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilter('end_date', e.target.value)}
                  className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </>
          )}

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Transaction Type</label>
            <select
              value={filters.transaction_type}
              onChange={(e) => setFilter('transaction_type', e.target.value as any)}
              className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all" className="bg-[#161c24] text-white">All Transactions</option>
              <option value="income" className="bg-[#161c24] text-white">Incomes Only</option>
              <option value="expense" className="bg-[#161c24] text-white">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Category / Source</label>
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all" className="bg-[#161c24] text-white">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c} className="bg-[#161c24] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Bank / Account</label>
            <select
              value={filters.account}
              onChange={(e) => setFilter('account', e.target.value)}
              className="w-full bg-[#0f141a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all" className="bg-[#161c24] text-white">All Accounts</option>
              {availableAccounts.map((a) => (
                <option key={a} value={a} className="bg-[#161c24] text-white">
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RiFilter3Line className="text-base" />
            {isLoading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
