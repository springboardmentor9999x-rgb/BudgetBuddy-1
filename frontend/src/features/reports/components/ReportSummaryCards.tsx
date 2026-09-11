import React from 'react';
import {
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
  RiWallet3Line,
  RiPercentLine,
} from 'react-icons/ri';
import type { ReportSummaryMetrics } from '../types/report.type.ts';

interface Props {
  summary: ReportSummaryMetrics;
}

export const ReportSummaryCards: React.FC<Props> = ({ summary }) => {
  const isSurplus = summary.net_savings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* ── Total Income ── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{summary.total_income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-medium">
                {summary.income_count} Inflows
              </span>
              <span>Avg: ₹{summary.avg_income_transaction.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
            <RiArrowUpCircleLine />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 to-teal-500/50" />
      </div>

      {/* ── Total Expenses ── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="text-2xl font-black text-rose-400 tracking-tight">
              ₹{summary.total_expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 font-medium">
                {summary.expense_count} Outflows
              </span>
              <span>Avg: ₹{summary.avg_expense_transaction.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 text-2xl group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
            <RiArrowDownCircleLine />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/50 to-red-500/50" />
      </div>

      {/* ── Net Savings ── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Net Savings / Flow
            </span>
            <div
              className={`text-2xl font-black tracking-tight ${
                isSurplus ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {isSurplus ? '+' : ''}₹
              {summary.net_savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
              <span
                className={`px-2 py-0.5 rounded-md font-medium ${
                  isSurplus
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'bg-rose-500/10 text-rose-300'
                }`}
              >
                {isSurplus ? 'Net Surplus' : 'Net Deficit'}
              </span>
              <span>{summary.total_transactions_count} Total Txns</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
            <RiWallet3Line />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/50 to-blue-500/50" />
      </div>

      {/* ── Savings Rate % ── */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="text-2xl font-black text-purple-400 tracking-tight">
              {summary.savings_rate}%
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-medium">
                {summary.savings_rate >= 20 ? 'Healthy' : 'Needs Attention'}
              </span>
              <span>Max Exp: ₹{summary.max_expense.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
            <RiPercentLine />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50" />
      </div>
    </div>
  );
};
