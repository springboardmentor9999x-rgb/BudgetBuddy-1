/**
 * Dashboard Page Component
 *
 * Displays financial overview, interactive weekly & category charts, user statistics cards,
 * and recent transaction logs connected to the backend API via Zustand store.
 */
import React, { useEffect } from 'react';
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
  FaCalendarAlt,
  FaCreditCard,
  FaSyncAlt,
} from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { GrTransaction } from 'react-icons/gr';

import useDashboardStore from '../store/useDashboardStore.ts';
import Loading from '../../Loading.tsx';

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

// Chart options for dark theme UI
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
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#94a3b8' },
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
  },
  cutout: '70%',
};

const Dashboard: React.FC = () => {
  const { stats, isLoading, error, fetchDashboardStats } = useDashboardStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Bar chart dataset setup from API stats
  const weeklyLabels = stats?.weekly_overview?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyIncome = stats?.weekly_overview?.income_data || [0, 0, 0, 0, 0, 0, 0];
  const weeklyExpenses = stats?.weekly_overview?.expense_data || [0, 0, 0, 0, 0, 0, 0];

  const barChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Income',
        data: weeklyIncome,
        backgroundColor: 'rgba(52, 211, 153, 0.7)', // emerald
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: weeklyExpenses,
        backgroundColor: 'rgba(251, 146, 60, 0.7)', // orange
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // Doughnut chart dataset setup from category spending
  const categories = stats?.category_spending || [];
  const categoryLabels = categories.map((c) => c.category);
  const categoryAmounts = categories.map((c) => c.amount);

  const colorPalette = [
    'rgba(99, 102, 241, 0.8)', // indigo
    'rgba(52, 211, 153, 0.8)', // emerald
    'rgba(251, 191, 36, 0.8)', // amber
    'rgba(251, 146, 60, 0.8)', // orange
    'rgba(236, 72, 153, 0.8)', // pink
    'rgba(168, 85, 247, 0.8)', // purple
    'rgba(14, 165, 233, 0.8)', // sky
  ];

  const doughnutChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses'],
    datasets: [
      {
        data: categoryAmounts.length > 0 ? categoryAmounts : [1],
        backgroundColor:
          categoryLabels.length > 0
            ? colorPalette.slice(0, categoryLabels.length)
            : ['rgba(148, 163, 184, 0.3)'],
        borderColor: '#1e252e',
        borderWidth: 3,
      },
    ],
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

  const transactions = stats?.recent_transactions || [];

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-4 md:p-8 font-sans">
      {isLoading && <Loading />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <FaWallet className="text-emerald-400" />
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back, here's your real-time financial overview
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-400" />
              <span>{stats?.monthly_overview?.current_month || 'Current Month'}</span>
            </div>
            <button
              onClick={() => fetchDashboardStats()}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-gray-300 transition-colors"
              title="Refresh Dashboard Stats"
            >
              <FaSyncAlt className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-6 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(userStats.balance)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaWallet className="text-emerald-400 text-xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              {userStats.balance_change >= 0 ? (
                <MdTrendingUp className="text-emerald-400 mr-1" />
              ) : (
                <MdTrendingDown className="text-red-400 mr-1" />
              )}
              <span
                className={`font-medium ${userStats.balance_change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
              >
                {userStats.balance_change >= 0 ? '+' : ''}
                {userStats.balance_change}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          {/* Income Card */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Income</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(userStats.income)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaArrowUp className="text-blue-400 text-xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              {userStats.income_change >= 0 ? (
                <MdTrendingUp className="text-emerald-400 mr-1" />
              ) : (
                <MdTrendingDown className="text-red-400 mr-1" />
              )}
              <span
                className={`font-medium ${userStats.income_change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
              >
                {userStats.income_change >= 0 ? '+' : ''}
                {userStats.income_change}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-6 border border-white/5 hover:border-orange-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Expenses
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(userStats.expenses)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaArrowDown className="text-orange-400 text-xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              {userStats.expense_change <= 0 ? (
                <MdTrendingDown className="text-emerald-400 mr-1" />
              ) : (
                <MdTrendingUp className="text-orange-400 mr-1" />
              )}
              <span
                className={`font-medium ${userStats.expense_change <= 0 ? 'text-emerald-400' : 'text-orange-400'
                  }`}
              >
                {userStats.expense_change >= 0 ? '+' : ''}
                {userStats.expense_change}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          {/* Savings Card */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-6 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Savings
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(userStats.savings)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaPiggyBank className="text-purple-400 text-xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              {userStats.monthly_change >= 0 ? (
                <MdTrendingUp className="text-emerald-400 mr-1" />
              ) : (
                <MdTrendingDown className="text-red-400 mr-1" />
              )}
              <span
                className={`font-medium ${userStats.monthly_change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
              >
                {userStats.monthly_change >= 0 ? '+' : ''}
                {userStats.monthly_change}%
              </span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Overview Bar Chart */}
          <div className="lg:col-span-2 bg-[#1e252e] rounded-xl shadow-lg p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Weekly Overview</h3>
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                Income vs Expenses
              </span>
            </div>
            <div className="h-64">
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>

          {/* Category Spending Doughnut Chart */}
          <div className="bg-[#1e252e] rounded-xl shadow-lg p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Spending</h3>
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                by category
              </span>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-[#1e252e] rounded-xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold text-gray-200 flex items-center gap-2">
              <FaCreditCard className="text-emerald-400" />
              Recent Transactions
              <span className="text-gray-400 ml-2">
                <GrTransaction />
              </span>
            </h3>
            <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
              Latest {transactions.length} items
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                No recent transactions found. Add your first income or expense to populate stats!
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={`${tx.type}-${tx.id}`}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${tx.amount > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-orange-500/20 text-orange-400'
                        }`}
                    >
                      {tx.amount > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-200">{tx.description}</p>
                      <p className="text-xs text-gray-400">
                        {tx.category} • {formatDate(tx.date)} • {tx.account}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-orange-400'
                      }`}
                  >
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 border-t border-white/5 pt-6">
          <span>Budget Buddy — Dynamic dashboard metrics synced with backend in real-time.</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;