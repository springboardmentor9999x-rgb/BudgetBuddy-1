import React from 'react';
import {
  RiPieChartLine,
  RiBankCardLine,
  RiMoneyDollarCircleLine,
} from 'react-icons/ri';
import type {
  ReportCategoryBreakdown,
  ReportSourceBreakdown,
  ReportAccountBreakdown,
} from '../types/report.type.ts';

interface Props {
  categories: ReportCategoryBreakdown[];
  sources: ReportSourceBreakdown[];
  accounts: ReportAccountBreakdown[];
}

export const ReportBreakdownTables: React.FC<Props> = ({
  categories,
  sources,
  accounts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* ─── 1. Expense Categories Breakdown ─── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <RiPieChartLine className="text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-200">Expense by Category</h4>
            <p className="text-xs text-gray-400">Sorted by highest spend</p>
          </div>
        </div>

        <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72 pr-1">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">No expenses in this period</p>
          ) : (
            categories.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {item.category}
                    <span className="text-[10px] text-gray-500">({item.count} txns)</span>
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-gray-200">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-400 ml-1.5 text-[11px] font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── 2. Income Sources Breakdown ─── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <RiMoneyDollarCircleLine className="text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-200">Income by Source</h4>
            <p className="text-xs text-gray-400">Inflow distribution</p>
          </div>
        </div>

        <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72 pr-1">
          {sources.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">No income in this period</p>
          ) : (
            sources.map((item) => (
              <div key={item.source} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {item.source}
                    <span className="text-[10px] text-gray-500">({item.count} txns)</span>
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-gray-200">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-400 ml-1.5 text-[11px] font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── 3. Account Activity Breakdown ─── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <RiBankCardLine className="text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-200">Account Cashflow</h4>
            <p className="text-xs text-gray-400">Activity across accounts</p>
          </div>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
          {accounts.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">No account activity recorded</p>
          ) : (
            accounts.map((item) => (
              <div
                key={item.account}
                className="bg-[#0f141a] rounded-xl p-3 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200 truncate max-w-[140px]">
                    {item.account}
                  </span>
                  <span
                    className={`text-xs font-extrabold ${
                      item.net_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.net_amount >= 0 ? '+' : ''}₹
                    {item.net_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="text-emerald-400">
                    +₹{item.income_amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-rose-400">
                    -₹{item.expense_amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-500">{item.transaction_count} txns</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
