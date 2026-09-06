import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  Users,
  CreditCard,
  Target,
  Download,
  AlertTriangle,
  Eye,
  EyeOff,
  TrendingUp,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useBudget } from '../context/BudgetContext';
import { formatMoney } from '../data/categories';
import { ExpenseItem, IncomeItem, ExpenseCategory } from '../types/budget';
import { ActiveTab } from './Navbar';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  onOpenAddModal: (type?: 'expense' | 'income') => void;
  onOpenBudgetModal: (category?: ExpenseCategory) => void;
  onOpenAddTransferModal?: () => void;
  onEditTransaction: (
    item: { type: 'expense'; data: ExpenseItem } | { type: 'income'; data: IncomeItem }
  ) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onOpenBudgetModal,
  onOpenAddTransferModal,
  onEditTransaction,
  setActiveTab,
}) => {
  const {
    user,
    selectedMonth,
    monthlyDashboard,
    cashFlowTrends,
    filteredTransfers,
    expenses,
    incomes,
    exportSingleTransaction,
    exportMasterFinancialReport,
  } = useBudget();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    budgetStatuses,
    recentTransactions,
  } = monthlyDashboard;

  // Format month for display
  const [yearStr, monthStr] = selectedMonth.split('-');
  const displayDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
  const formattedMonthTag = displayDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Find exceeded or warning budgets
  const warningBudgets = budgetStatuses.filter(
    (b) => b.status === 'exceeded' || b.status === 'warning'
  );

  // Transfers summary
  const totalReceivedP2P = filteredTransfers
    .filter((t) => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSentP2P = filteredTransfers
    .filter((t) => t.type === 'sent')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDownloadTransactionExcel = (
    e: React.MouseEvent,
    tx: { id: string; type: 'expense' | 'income'; description: string; amount: number; date: string; categoryOrSource: string }
  ) => {
    e.stopPropagation();
    exportSingleTransaction({
      id: tx.id,
      type: tx.type,
      title: tx.description,
      amount: tx.amount,
      date: tx.date,
      categoryOrSource: tx.categoryOrSource,
      status: 'Settled & Verified',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Alert Banner if any category exceeds limit */}
      {warningBudgets.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-200">
                Budget Alert: {warningBudgets.length} Category {warningBudgets.length > 1 ? 'Limits' : 'Limit'} Exceeded / Warning
              </p>
              <p className="text-xs text-amber-300/80">
                {warningBudgets.map((b) => `${b.category} (${b.percentage}%)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition-colors cursor-pointer shrink-0"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Hero Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Glow Orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-mono-code uppercase tracking-wider text-indigo-400 font-semibold">
                Monthly Net Cashflow • {formattedMonthTag}
              </span>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                title={isBalanceHidden ? 'Show Amount' : 'Hide Amount'}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1"
              >
                {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                {isBalanceHidden
                  ? '••••••••'
                  : formatMoney(netSavings, user.currency)}
              </h2>
              <span
                className={`text-sm font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  netSavings >= 0
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {netSavings >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5 rotate-180" />}
                {savingsRate}% Savings Rate
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Track real-time cash inflows, category ceilings, card instruments, and download formatted single-click Excel vouchers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="print-hidden btn-secondary-glass text-xs sm:text-sm py-2.5 px-3.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="btn-primary-gradient text-xs sm:text-sm py-2.5 px-4 cursor-pointer print-hidden"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => onOpenAddModal('income')}
              className="btn-emerald-gradient text-xs sm:text-sm py-2.5 px-4 cursor-pointer print-hidden"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button
              onClick={onOpenAddTransferModal}
              className="btn-secondary-glass text-xs sm:text-sm py-2.5 px-3.5 cursor-pointer print-hidden"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Total Income Card */}
        <div className="glass-card glass-card-hover p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Inflow</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-display font-bold text-2xl text-white">
              +{formatMoney(totalIncome, user.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{incomes.length}</span> Active Inflow Stream{incomes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="glass-card glass-card-hover p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Outflow</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-display font-bold text-2xl text-white">
              -{formatMoney(totalExpenses, user.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-rose-400 font-semibold">{expenses.length}</span> Recorded Transaction{expenses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* P2P Ledger Card */}
        <div
          onClick={() => setActiveTab('transfers')}
          className="glass-card glass-card-hover p-5 relative overflow-hidden cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
              Peer-to-Peer
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-display font-bold text-xl text-white">
              +{formatMoney(totalReceivedP2P, user.currency)} / -{formatMoney(totalSentP2P, user.currency)}
            </h3>
            <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-medium">
              <span>{filteredTransfers.length} P2P Transfers</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Cash Flow Velocity Chart + Category Ceilings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Cash Flow Velocity</h3>
                <p className="text-xs text-slate-400">Income vs. Expense across recent periods</p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `${user.currency === 'INR' ? '₹' : '$'}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(value: any, name: any) => [
                      formatMoney(Number(value), user.currency),
                      name === 'income' ? 'Total Inflow' : 'Total Outflow',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Category Utilization Meter */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">Category Ceilings Utilization</span>
              <button
                onClick={() => onOpenBudgetModal()}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                + Configure Limits
              </button>
            </div>
            <div className="space-y-3">
              {budgetStatuses.slice(0, 4).map((b) => {
                const isOver = b.status === 'exceeded';
                const isWarning = b.status === 'warning';
                return (
                  <div key={b.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{b.category}</span>
                      <span className="font-mono-code text-slate-400">
                        {formatMoney(b.spent, user.currency)} / {formatMoney(b.budget, user.currency)}{' '}
                        <span
                          className={`font-bold ${
                            isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          ({b.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Recent Transactions Feed (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Latest recorded financial entries</p>
              </div>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No recent activity recorded for this period.
                <button
                  onClick={() => onOpenAddModal('expense')}
                  className="block mx-auto mt-2 text-indigo-400 hover:underline font-semibold"
                >
                  + Add First Transaction
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {recentTransactions.slice(0, 6).map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const d = new Date(tx.date);
                  const dateStr = !isNaN(d.getTime())
                    ? d.toLocaleString('default', { month: 'short', day: 'numeric' })
                    : tx.date;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        if (isExpense) {
                          const exp = expenses.find((e) => e.id === tx.id);
                          if (exp) onEditTransaction({ type: 'expense', data: exp });
                        } else {
                          const inc = incomes.find((i) => i.id === tx.id);
                          if (inc) onEditTransaction({ type: 'income', data: inc });
                        }
                      }}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-800/40 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isExpense
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          <CategoryIcon name={tx.categoryOrSource} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                            {tx.description}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span className="truncate">{tx.categoryOrSource}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono-code font-bold text-xs sm:text-sm ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatMoney(tx.amount, user.currency)}
                        </span>

                        {/* Single-Click Excel Voucher */}
                        <button
                          onClick={(e) => handleDownloadTransactionExcel(e, tx)}
                          title="Download Excel Voucher (.xls)"
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Total in View: {recentTransactions.length} items</span>
            <button
              onClick={exportMasterFinancialReport}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Full Excel Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

