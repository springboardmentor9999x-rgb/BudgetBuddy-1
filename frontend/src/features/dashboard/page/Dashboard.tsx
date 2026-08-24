/**
 * Dashboard Page Component - Verbose Financial Control Center
 *
 * Displays a comprehensive, multi-widget financial dashboard with:
 * - Interactive Month/Year filtering & Quick Presets
 * - Key Financial Health KPIs (Balance, Gross Income, Expenses Deducted, Net Savings, Savings Rate, Daily Burn Rate, Projections)
 * - Visual Charts (Income vs Expense Bar Chart, Category Spending Doughnut Chart, 6-Month Cash Flow History)
 * - Active Budgets Real-Time Health Tracker
 * - Savings Goals Tracker with Direct "+ Contribute" Modal Trigger
 * - Bank Accounts Liquidity Breakdown
 * - Intelligent Financial Insights & Smart Tips
 * - Searchable & Filterable Recent Activity Stream
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
  FaFire,
  FaTrophy,
  FaLightbulb,
  FaSearch,
  FaPlusCircle,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { GrTransaction } from 'react-icons/gr';
import { RiBankCardLine, RiWalletLine, RiTargetLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';

import useDashboardStore from '../store/useDashboardStore';
import useBudgetStore from '../../budget/store/useBudgetStore';
import useSavingGoalStore from '../../saving_goals/store/useSavingGoalStore';
import useAccountStore from '../../account/store/useAccountStore';
import { useNotificationStore } from '../../notifications/useNotificationStore';
import type { SavingGoal } from '../../saving_goals/types/saving.type';

import ContributeModal from '../../saving_goals/components/ContributeModal';
import Loading from '../../Loading';
import ContentWrapper from '../../../components/ContentWrapper';
import { setPageTitle } from '../../../utils/setTitle';

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

  const { budgets, fetchBudgets } = useBudgetStore(
    useShallow((s) => ({ budgets: s.budgets, fetchBudgets: s.fetchBudgets }))
  );

  const { goals, fetchGoals, contributeToGoal } = useSavingGoalStore(
    useShallow((s) => ({
      goals: s.goals,
      fetchGoals: s.fetchGoals,
      contributeToGoal: s.contributeToGoal,
    }))
  );

  const { bankAccounts, fetchBankAccounts } = useAccountStore(
    useShallow((s) => ({ bankAccounts: s.bankAccounts, fetchBankAccounts: s.fetchBankAccounts }))
  );

  const addNotification = useNotificationStore((s) => s.addNotification);

  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contributeGoal, setContributeGoal] = useState<SavingGoal | null>(null);

  const now = new Date();
  const currentYearNum = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  useEffect(() => {
    Promise.allSettled([
      fetchDashboardStats(),
      fetchBudgets(),
      fetchGoals(),
      fetchBankAccounts(),
    ]);
  }, [fetchDashboardStats, fetchBudgets, fetchGoals, fetchBankAccounts]);

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

  // Advanced Financial Calculations
  const savingsRate = userStats.income > 0 ? ((userStats.savings / userStats.income) * 100) : 0;
  const daysInPeriod = selectedMonth ? new Date(selectedYear, selectedMonth, 0).getDate() : 30;
  const currentDayOfMonth = selectedMonth === currentMonthNum && selectedYear === currentYearNum ? now.getDate() : daysInPeriod;
  const dailyAverageSpend = currentDayOfMonth > 0 ? (userStats.expenses / currentDayOfMonth) : 0;
  const projectedMonthExpenses = dailyAverageSpend * daysInPeriod;

  // Financial Health Evaluation
  const healthStatus = useMemo(() => {
    if (userStats.income === 0 && userStats.expenses === 0) {
      return { label: 'Getting Started', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', desc: 'Add income and expenses to unlock insights' };
    }
    if (savingsRate >= 40) {
      return { label: 'Excellent Wealth Accumulation', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', desc: `Saving ${savingsRate.toFixed(0)}% of your income — exceptional cash retention!` };
    }
    if (savingsRate >= 20) {
      return { label: 'Healthy Savings Pace', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', desc: `Saving ${savingsRate.toFixed(0)}% of income meets the 50/30/20 rule.` };
    }
    if (savingsRate >= 0) {
      return { label: 'Balanced Cash Flow', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', desc: `Expenses consume ${(100 - savingsRate).toFixed(0)}% of your period income.` };
    }
    return { label: 'Deficit Warning', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', desc: `Spending exceeds income by ${formatCurrency(Math.abs(userStats.savings))}.` };
  }, [savingsRate, userStats]);

  // Bar chart data
  const chartLabels = stats?.weekly_overview?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartIncome = stats?.weekly_overview?.income_data || [0, 0, 0, 0, 0, 0, 0];
  const chartExpenses = stats?.weekly_overview?.expense_data || [0, 0, 0, 0, 0, 0, 0];

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Gross Income',
        data: chartIncome,
        backgroundColor: 'rgba(16, 185, 129, 0.75)', // emerald
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Expenses Deducted',
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

  // Search & Filtered transactions
  const transactions = useMemo(() => {
    let raw = stats?.recent_transactions || [];
    if (txFilter !== 'all') {
      raw = raw.filter((t) => t.type === txFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      raw = raw.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.account && t.account.toLowerCase().includes(q))
      );
    }
    return raw;
  }, [stats?.recent_transactions, txFilter, searchQuery]);

  // Spending per category map for active budget widget
  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.category] = c.amount;
    });
    return map;
  }, [categories]);

  // Smart AI/Rule Insights
  const smartInsights = useMemo(() => {
    const tips: { id: string; icon: React.ReactNode; text: string; type: 'info' | 'warn' | 'success' }[] = [];

    // Top Category insight
    if (categories.length > 0) {
      const top = categories[0];
      tips.push({
        id: 'top-cat',
        icon: <FaFire className="text-amber-400" />,
        text: `Top expense is ${top.category} at ${formatCurrency(top.amount)} (${top.percentage}% of spending).`,
        type: 'info',
      });
    }

    // Savings Milestone insight
    const nearGoal = goals.find((g) => {
      const pct = Number(g.target_amount) > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0;
      return pct >= 90 && pct < 100;
    });
    if (nearGoal) {
      const pct = (Number(nearGoal.current_amount) / Number(nearGoal.target_amount)) * 100;
      tips.push({
        id: 'goal-near',
        icon: <FaTrophy className="text-amber-400" />,
        text: `"${nearGoal.goal_name}" is at ${pct.toFixed(0)}% — only ${formatCurrency(Number(nearGoal.target_amount) - Number(nearGoal.current_amount))} left!`,
        type: 'success',
      });
    }

    // Budget overspend alert
    const overspentBudgets = budgets.filter((b) => (categorySpentMap[b.category] ?? 0) > Number(b.monthly_limit));
    if (overspentBudgets.length > 0) {
      tips.push({
        id: 'budget-warn',
        icon: <FaExclamationTriangle className="text-rose-400" />,
        text: `${overspentBudgets.length} budget category has exceeded its limit for this period.`,
        type: 'warn',
      });
    } else if (budgets.length > 0) {
      tips.push({
        id: 'budget-good',
        icon: <FaCheckCircle className="text-emerald-400" />,
        text: `All ${budgets.length} active budgets are within their spending limits.`,
        type: 'success',
      });
    }

    // Savings Rate Insight
    if (savingsRate > 30) {
      tips.push({
        id: 'sav-rate',
        icon: <FaPiggyBank className="text-purple-400" />,
        text: `Healthy savings rate of ${savingsRate.toFixed(0)}% enables rapid goal progression.`,
        type: 'success',
      });
    }

    return tips;
  }, [categories, goals, budgets, categorySpentMap, savingsRate]);

  // Handle contribution from dashboard widget
  const handleContribute = async (goalId: number, amount: number, accountId?: number) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    const prevCurrent = targetGoal ? Number(targetGoal.current_amount) : 0;
    const targetAmt = targetGoal ? Number(targetGoal.target_amount) : 0;

    await contributeToGoal(goalId, amount, accountId);
    await Promise.all([fetchGoals(), fetchDashboardStats(), fetchBankAccounts()]);

    const newCurrent = prevCurrent + amount;
    const newPct = targetAmt > 0 ? (newCurrent / targetAmt) * 100 : 0;
    const prevPct = targetAmt > 0 ? (prevCurrent / targetAmt) * 100 : 0;

    if (newPct >= 100 && prevPct < 100) {
      addNotification({
        type: 'goal_complete',
        title: `🏆 Goal Achieved: ${targetGoal?.goal_name}!`,
        message: `"${targetGoal?.goal_name}" is 100% funded (${formatCurrency(newCurrent)})!`,
        dedupKey: `goal:${goalId}:completed`,
      });
      toast.success(`🎉 Goal Completed! "${targetGoal?.goal_name}" is 100% funded!`);
    } else if (newPct >= 90 && prevPct < 90) {
      addNotification({
        type: 'goal_near',
        title: `🔥 90% Goal Milestone: ${targetGoal?.goal_name}!`,
        message: `"${targetGoal?.goal_name}" reached ${newPct.toFixed(0)}% (${formatCurrency(newCurrent)})!`,
        dedupKey: `goal:${goalId}:near_90`,
      });
      toast.success(`🔥 90% Milestone reached for "${targetGoal?.goal_name}"!`);
    } else {
      toast.success(`Contributed ${formatCurrency(amount)} to "${targetGoal?.goal_name}"!`);
    }
  };

  const yearOptions = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1];

  return (
    <ContentWrapper>
      {isLoading && <Loading />}

      <div className="flex-1 max-width mx-auto w-full py-2 space-y-6">
        {/* ── 1. Top Header & Interactive Filter Bar ────────────────────────── */}
        <div className="bg-[#1e252e] rounded-2xl border border-white/5 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title & Active Filter Subtitle */}
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
                  <FaWallet className="text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Dashboard</h1>
                  <p className="text-xs text-gray-400">
                    Comprehensive overview for{' '}
                    <span className="text-emerald-300 font-semibold">{stats?.monthly_overview?.current_month || 'Current Period'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Filter controls & Quick Presets */}
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
                onClick={() => {
                  fetchDashboardStats();
                  fetchBudgets();
                  fetchGoals();
                  fetchBankAccounts();
                  toast.success('Dashboard refreshed');
                }}
                className="p-2 bg-[#161c24] hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all"
                title="Refresh All"
              >
                <FaSyncAlt className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* ── 2. Financial Health Banner & Burn Rate Status ─────────────────── */}
        <div className={`p-4 rounded-2xl border ${healthStatus.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl">
              <FaLightbulb className={`${healthStatus.color} text-lg`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${healthStatus.color}`}>
                  Financial Health: {healthStatus.label}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                  {savingsRate >= 0 ? `${savingsRate.toFixed(0)}% Savings Rate` : 'Deficit'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">{healthStatus.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-gray-400 text-[10px] uppercase">Daily Avg Spend</span>
              <p className="font-bold text-white">{formatCurrency(dailyAverageSpend)}/day</p>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <span className="text-gray-400 text-[10px] uppercase">Month-End Pace</span>
              <p className="font-bold text-rose-400">{formatCurrency(projectedMonthExpenses)}</p>
            </div>
          </div>
        </div>

        {/* ── 3. Verbose KPI Metrics Row (4 Cards) ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Total Balance */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Net Balance</p>
                <p className="text-2xl font-extrabold text-white mt-1.5">{formatCurrency(userStats.balance)}</p>
                <p className="text-xs text-gray-400 mt-1">{bankAccounts.length} linked bank accounts</p>
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

          {/* Period Gross Income */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Gross Income</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1.5">{formatCurrency(userStats.income)}</p>
                <p className="text-xs text-gray-400 mt-1">Earned in period</p>
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

          {/* Period Expenses Deducted */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-rose-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Expenses Deducted</p>
                <p className="text-2xl font-extrabold text-rose-400 mt-1.5">{formatCurrency(userStats.expenses)}</p>
                <p className="text-xs text-gray-400 mt-1">Deducted from income</p>
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

          {/* Net Retained Savings */}
          <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Net Retained Savings</p>
                <p className={`text-2xl font-extrabold mt-1.5 ${userStats.savings >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                  {formatCurrency(userStats.savings)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {userStats.income > 0 ? `${savingsRate.toFixed(0)}% retention rate` : 'Income - Expenses'}
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

        {/* ── 4. Main Charts Section ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expenses Bar Chart */}
          <div className="lg:col-span-2 bg-[#1e252e] rounded-2xl shadow-lg p-5 sm:p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Income vs Expenses Distribution</h3>
                <p className="text-xs text-gray-400">
                  {selectedMonth === null ? '12-Month period trend' : 'Weekly cash flow for selected period'}
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

        {/* ── 5. Active Budgets & Savings Goals Double Section ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Budgets Live Tracker */}
          <div className="bg-[#1e252e] rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <RiWalletLine size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Active Budgets Health</h3>
                    <p className="text-xs text-gray-400">Real-time spend vs monthly category limits</p>
                  </div>
                </div>
                <Link
                  to="/budget"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 transition-all"
                >
                  Manage Budgets →
                </Link>
              </div>

              {budgets.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  <p>No active category budgets defined yet.</p>
                  <Link to="/budget" className="mt-2 inline-block text-emerald-400 font-semibold hover:underline">
                    + Set your first budget limit
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5 mt-2">
                  {budgets.slice(0, 4).map((b) => {
                    const spent = categorySpentMap[b.category] ?? 0;
                    const limit = Number(b.monthly_limit);
                    const pct = limit > 0 ? (spent / limit) * 100 : 0;
                    const isExceeded = spent > limit;
                    const isWarning = pct >= 80 && !isExceeded;

                    return (
                      <div key={b.id} className="bg-[#161c24] rounded-xl p-3.5 border border-white/5">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            {b.category}
                            {isExceeded && (
                              <span className="text-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded-full font-bold">
                                EXCEEDED
                              </span>
                            )}
                            {isWarning && (
                              <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                                80%+ WARNING
                              </span>
                            )}
                          </span>
                          <span className="text-gray-300 font-mono">
                            {formatCurrency(spent)} / {formatCurrency(limit)} ({pct.toFixed(0)}%)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExceeded
                                ? 'bg-rose-500'
                                : isWarning
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                          <span>{isExceeded ? `Over by ${formatCurrency(spent - limit)}` : `Remaining: ${formatCurrency(limit - spent)}`}</span>
                          <span>Monthly Limit: {formatCurrency(limit)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {budgets.length > 4 && (
              <p className="text-[11px] text-gray-400 text-center mt-3 pt-2 border-t border-white/5">
                +{budgets.length - 4} more budgets configured in Budget Manager
              </p>
            )}
          </div>

          {/* Savings Goals Live Widget */}
          <div className="bg-[#1e252e] rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                    <RiTargetLine size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Savings Goals Progress</h3>
                    <p className="text-xs text-gray-400">Fund goals and reach target milestones</p>
                  </div>
                </div>
                <Link
                  to="/saving-goals"
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20 transition-all"
                >
                  View All Goals →
                </Link>
              </div>

              {goals.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  <p>No savings goals created yet.</p>
                  <Link to="/saving-goals" className="mt-2 inline-block text-purple-400 font-semibold hover:underline">
                    + Set a new savings goal
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5 mt-2">
                  {goals.slice(0, 3).map((g) => {
                    const current = Number(g.current_amount);
                    const target = Number(g.target_amount);
                    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                    const isComplete = pct >= 100;
                    const is90Milestone = pct >= 90 && !isComplete;

                    return (
                      <div key={g.id} className="bg-[#161c24] rounded-xl p-3.5 border border-white/5">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                              {g.goal_name}
                              {isComplete && (
                                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                                  100% COMPLETE
                                </span>
                              )}
                              {is90Milestone && (
                                <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                                  90% MILESTONE
                                </span>
                              )}
                            </span>
                            <p className="text-[10px] text-gray-400">
                              Target Date: {new Date(g.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>

                          {!isComplete && (
                            <button
                              onClick={() => setContributeGoal(g)}
                              className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-[11px] font-bold rounded-lg border border-purple-500/40 transition-all flex items-center gap-1 shadow-sm"
                            >
                              <FaPlusCircle size={10} /> Contribute
                            </button>
                          )}
                        </div>

                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden my-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isComplete
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                                : is90Milestone
                                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                          <span>Saved: {formatCurrency(current)}</span>
                          <span>Target: {formatCurrency(target)} ({pct.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {goals.length > 3 && (
              <p className="text-[11px] text-gray-400 text-center mt-3 pt-2 border-t border-white/5">
                +{goals.length - 3} more goals tracked in Savings Manager
              </p>
            )}
          </div>
        </div>

        {/* ── 6. Linked Bank Accounts & Smart Insights ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linked Bank Accounts */}
          <div className="bg-[#1e252e] rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                    <RiBankCardLine size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Liquidity & Accounts</h3>
                    <p className="text-xs text-gray-400">Real-time balances across linked banks</p>
                  </div>
                </div>
                <Link
                  to="/account"
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 transition-all"
                >
                  Manage →
                </Link>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  <p>No bank accounts linked yet.</p>
                  <Link to="/account" className="mt-2 inline-block text-blue-400 font-semibold hover:underline">
                    + Link a bank account
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {bankAccounts.map((acc) => {
                    const totalBal = bankAccounts.reduce((s, a) => s + Number(a.balance), 0);
                    const share = totalBal > 0 ? (Number(acc.balance) / totalBal) * 100 : 0;
                    return (
                      <div key={acc.id} className="bg-[#161c24] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {acc.bank_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{acc.bank_name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">•••• {acc.account_number.slice(-4)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{formatCurrency(Number(acc.balance))}</p>
                          <p className="text-[10px] text-gray-500">{share.toFixed(0)}% of funds</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Smart Insights & Recommendations */}
          <div className="lg:col-span-2 bg-[#1e252e] rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <FaLightbulb size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Smart Financial Insights & Tips</h3>
                  <p className="text-xs text-gray-400">Automated financial signals based on your recent activity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {smartInsights.map((tip) => (
                  <div
                    key={tip.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      tip.type === 'warn'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        : tip.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-[#161c24] border-white/5 text-gray-300'
                    }`}
                  >
                    <div className="p-1.5 bg-white/5 rounded-lg shrink-0 mt-0.5">{tip.icon}</div>
                    <p className="text-xs leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action bar */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-gray-400">Quick Actions:</span>
              <div className="flex gap-2">
                <Link
                  to="/income"
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl font-semibold transition-all flex items-center gap-1.5"
                >
                  <FaPlus size={10} /> Add Income
                </Link>
                <Link
                  to="/expenses"
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl font-semibold transition-all flex items-center gap-1.5"
                >
                  <FaPlus size={10} /> Add Expense
                </Link>
                <Link
                  to="/saving-goals"
                  className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl font-semibold transition-all flex items-center gap-1.5"
                >
                  <FaPlus size={10} /> Add Goal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. Searchable & Filterable Transactions Stream ─────────────────── */}
        <div className="bg-[#1e252e] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-[#1a2128] gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                <GrTransaction size={16} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Transactions in Period</h3>
                <span className="text-xs text-gray-400">
                  {transactions.length} transactions matched
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#161c24] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-44 sm:w-56"
                />
              </div>

              {/* Filter by Income / Expense */}
              <div className="flex gap-1 bg-[#161c24] p-1 rounded-xl border border-white/5">
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
          </div>

          <div className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                <p className="font-medium text-gray-300">No transactions found for this query.</p>
                <p className="text-gray-500 text-xs mt-1">
                  Try clearing the search query or adding a new transaction.
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
                        <span className="font-medium text-gray-300">{tx.category}</span> • {formatDate(String(tx.date))} • <span className="text-gray-400 font-mono">{tx.account}</span>
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

      {/* ── Direct Contribute Modal on Dashboard ────────────────────────────── */}
      <ContributeModal
        isOpen={contributeGoal !== null}
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onContribute={handleContribute}
      />
    </ContentWrapper>
  );
};

export default Dashboard;