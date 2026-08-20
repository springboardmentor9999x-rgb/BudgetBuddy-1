/**
 * Dashboard Page Component
 *
 * Displays a clean, simplified financial overview with interactive Month & Year filtering,
 * key summary metrics, visual comparison charts, category breakdowns, and recent transactions.
 */
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaFilter,
  FaSyncAlt,
  FaPlus,
} from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { GrTransaction } from 'react-icons/gr';

import useDashboardStore from '../store/useDashboardStore.ts';
import Loading from '../../Loading.tsx';
import ContentWrapper from '../../../components/ContentWrapper.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const MONTHS = [
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

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: '#1e252e',
      titleColor: '#fff',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (context: any) => ` ${context.dataset.label}: ₹${Number(context.raw || 0).toLocaleString('en-IN')}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: {
        color: '#94a3b8',
        callback: (value: any) => `₹${Number(value).toLocaleString('en-IN')}`,
      },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8' },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: '#1e252e',
      titleColor: '#fff',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (context: any) => ` ₹${Number(context.raw || 0).toLocaleString('en-IN')}`,
      },
    },
  },
  cutout: '72%',
};

const colorPalette = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f97316', // orange
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#ef4444', // red
];

const Dashboard = () => {
  setPageTitle('Dashboard | BudgetBuddy');

  const {
    stats,
    isLoading,
    error,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    fetchDashboardStats,
  } = useDashboardStore();

  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');

  const now = new Date();
  const currentYearNum = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = (value: number) => {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Preset Handlers
  const handleSetPreset = (preset: 'this_month' | 'last_month' | 'this_year' | 'all_time') => {
    if (preset === 'this_month') {
      setSelectedYear(currentYearNum);
      setSelectedMonth(currentMonthNum);
    } else if (preset === 'last_month') {
      const prevM = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
      const prevY = currentMonthNum === 1 ? currentYearNum - 1 : currentYearNum;
      setSelectedYear(prevY);
      setSelectedMonth(prevM);
    } else if (preset === 'this_year') {
      setSelectedYear(currentYearNum);
      setSelectedMonth(null);
    } else if (preset === 'all_time') {
      setSelectedMonth(null);
      setSelectedYear(currentYearNum);
    }
  };

  const userStats = stats?.user_stats || {
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    monthly_change: 0,
    balance_change: 0,
    income_change: 0,
    expense_change: 0,
  };

  // Bar chart data
  const chartLabels = stats?.weekly_overview?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartIncome = stats?.weekly_overview?.income_data || [0, 0, 0, 0, 0, 0, 0];
  const chartExpenses = stats?.weekly_overview?.expense_data || [0, 0, 0, 0, 0, 0, 0];

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Income',
        data: chartIncome,
        backgroundColor: 'rgba(16, 185, 129, 0.75)', // emerald
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: chartExpenses,
        backgroundColor: 'rgba(244, 63, 94, 0.75)', // rose
        borderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Category Donut Chart
  const categories = stats?.category_spending || [];
  const categoryLabels = categories.map((c) => c.category);
  const categoryAmounts = categories.map((c) => c.amount);

  const doughnutChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses in Period'],
    datasets: [
      {
        data: categoryAmounts.length > 0 ? categoryAmounts : [1],
        backgroundColor:
          categoryLabels.length > 0
            ? colorPalette.slice(0, categoryLabels.length)
            : ['rgba(148, 163, 184, 0.2)'],
        borderColor: '#1e252e',
        borderWidth: 2,
      },
    ],
  };

  // Filtered transactions
  const transactions = useMemo(() => {
    const raw = stats?.recent_transactions || [];
    if (txFilter === 'all') return raw;
    return raw.filter((t) => t.type === txFilter);
  }, [stats?.recent_transactions, txFilter]);

  const yearOptions = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1];

  return (
    <ContentWrapper>
      {isLoading && <Loading />}

      <div className="flex-1 max-width mx-auto w-full py-2">
        {/* ── Top Header & Filter Toolbar ──────────────────────────────── */}
        <div className="bg-[#1e252e] rounded-2xl border border-white/5 p-4 sm:p-5 mb-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title & Period info */}
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                  <FaWallet className="text-xl text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                  <p className="text-xs text-gray-400">
                    Showing stats for <span className="text-emerald-300 font-semibold">{stats?.monthly_overview?.current_month || 'Current Period'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Presets */}
              <div className="flex bg-[#161c24] p-1 rounded-xl border border-white/5 gap-1">
                <button
                  onClick={() => handleSetPreset('this_month')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedMonth === currentMonthNum && selectedYear === currentYearNum
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => handleSetPreset('last_month')}
                  className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white rounded-lg transition-all"
                >
                  Last Month
                </button>
                <button
                  onClick={() => handleSetPreset('this_year')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedMonth === null && selectedYear === currentYearNum
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Full Year
                </button>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-1 bg-[#161c24] px-2.5 py-1.5 rounded-xl border border-white/5">
                <FaFilter className="text-gray-500 text-xs" />
                <select
                  value={selectedMonth ?? ''}
                  onChange={(e) => setSelectedMonth(e.target.value === '' ? null : Number(e.target.value))}
                  className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">All Months</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="bg-[#161c24] px-2.5 py-1.5 rounded-xl border border-white/5">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchDashboardStats()}
                className="p-2 bg-[#161c24] hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all"
                title="Refresh"
              >
                <FaSyncAlt className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* ── 4 Simplified KPI Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Balance */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Balance</p>
                <p className="text-2xl font-extrabold text-white mt-1.5">{formatCurrency(userStats.balance)}</p>
                <p className="text-xs text-gray-500 mt-1">Across bank accounts</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaWallet className="text-emerald-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              {userStats.balance_change >= 0 ? (
                <MdTrendingUp className="text-emerald-400 mr-1 text-sm" />
              ) : (
                <MdTrendingDown className="text-rose-400 mr-1 text-sm" />
              )}
              <span className={`font-semibold ${userStats.balance_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userStats.balance_change >= 0 ? '+' : ''}{userStats.balance_change}%
              </span>
              <span className="text-gray-500 ml-1.5">vs previous period</span>
            </div>
          </div>

          {/* Income */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Period Income</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1.5">{formatCurrency(userStats.income)}</p>
                <p className="text-xs text-gray-500 mt-1">Earned in period</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaArrowUp className="text-blue-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              {userStats.income_change >= 0 ? (
                <MdTrendingUp className="text-emerald-400 mr-1 text-sm" />
              ) : (
                <MdTrendingDown className="text-rose-400 mr-1 text-sm" />
              )}
              <span className={`font-semibold ${userStats.income_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userStats.income_change >= 0 ? '+' : ''}{userStats.income_change}%
              </span>
              <span className="text-gray-500 ml-1.5">vs previous period</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-rose-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Period Expenses</p>
                <p className="text-2xl font-extrabold text-rose-400 mt-1.5">{formatCurrency(userStats.expenses)}</p>
                <p className="text-xs text-gray-500 mt-1">Spent in period</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaArrowDown className="text-rose-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              {userStats.expense_change <= 0 ? (
                <MdTrendingDown className="text-emerald-400 mr-1 text-sm" />
              ) : (
                <MdTrendingUp className="text-rose-400 mr-1 text-sm" />
              )}
              <span className={`font-semibold ${userStats.expense_change <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userStats.expense_change >= 0 ? '+' : ''}{userStats.expense_change}%
              </span>
              <span className="text-gray-500 ml-1.5">vs previous period</span>
            </div>
          </div>

          {/* Net Savings */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Net Savings</p>
                <p className={`text-2xl font-extrabold mt-1.5 ${userStats.savings >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                  {formatCurrency(userStats.savings)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {userStats.income > 0
                    ? `${Math.max(0, Math.round((userStats.savings / userStats.income) * 100))}% saved`
                    : 'Savings rate'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaPiggyBank className="text-purple-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              {userStats.monthly_change >= 0 ? (
                <MdTrendingUp className="text-emerald-400 mr-1 text-sm" />
              ) : (
                <MdTrendingDown className="text-rose-400 mr-1 text-sm" />
              )}
              <span className={`font-semibold ${userStats.monthly_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userStats.monthly_change >= 0 ? '+' : ''}{userStats.monthly_change}%
              </span>
              <span className="text-gray-500 ml-1.5">vs previous period</span>
            </div>
          </div>
        </div>

        {/* ── 2 Main Charts ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Income vs Expenses Bar Chart */}
          <div className="lg:col-span-2 bg-[#1e252e] rounded-2xl shadow-lg p-5 sm:p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Income vs Expenses</h3>
                <p className="text-xs text-gray-400">
                  {selectedMonth === null ? '12-Month distribution' : 'Weekly breakdown for period'}
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {selectedMonth ? MONTHS.find((m) => m.value === selectedMonth)?.label : 'Full Year'} {selectedYear}
              </span>
            </div>
            <div className="h-64 sm:h-72">
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>

          {/* Spending by Category Doughnut */}
          <div className="bg-[#1e252e] rounded-2xl shadow-lg p-5 sm:p-6 border border-white/5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-base">Spending Breakdown</h3>
                <p className="text-xs text-gray-400">By category in selected period</p>
              </div>
            </div>

            <div className="h-48 sm:h-52 flex items-center justify-center my-auto">
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            </div>

            {/* Top 3 categories summary */}
            {categories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-xs">
                {categories.slice(0, 3).map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-gray-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorPalette[i % colorPalette.length] }} />
                      {c.category}
                    </span>
                    <span className="font-semibold text-white">{c.percentage}% ({formatCurrency(c.amount)})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Transactions Section ──────────────────────────────── */}
        <div className="bg-[#1e252e] rounded-2xl border border-white/5 overflow-hidden shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-white/5 bg-[#1a2128] gap-3">
            <div className="flex items-center gap-2">
              <GrTransaction className="text-purple-400" />
              <h3 className="font-bold text-white text-base">Transactions in Period</h3>
              <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                {transactions.length} items
              </span>
            </div>

            {/* Filter by Income / Expense */}
            <div className="flex gap-1 bg-[#161c24] p-1 rounded-xl border border-white/5 self-start sm:self-auto">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTxFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    txFilter === t
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                <p className="font-medium text-gray-300">No transactions found for this period.</p>
                <p className="text-gray-500 text-xs mt-1">
                  Add income or expense transactions to populate your dashboard!
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Link
                    to="/income"
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <FaPlus size={10} /> Add Income
                  </Link>
                  <Link
                    to="/expenses"
                    className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <FaPlus size={10} /> Add Expense
                  </Link>
                </div>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={`${tx.type}-${tx.id}`}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        tx.amount > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-200">{tx.description}</p>
                      <p className="text-[11px] text-gray-400">
                        {tx.category} • {formatDate(tx.date)} • {tx.account}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
};

export default Dashboard;