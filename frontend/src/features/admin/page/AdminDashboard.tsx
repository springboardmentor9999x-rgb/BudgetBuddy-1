import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  RiShieldUserLine,
  RiGroupLine,
  RiUserFollowLine,
  RiBankCardLine,
  RiExchangeDollarLine,
  RiFileList3Line,
  RiRefreshLine,
} from 'react-icons/ri';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

import ContentWrapper from '../../../components/ContentWrapper.tsx';
import Loading from '../../Loading.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';
import {
  fetchSystemAnalyticsApi,
  type SystemAnalyticsResponse,
} from '../services/admin.api.ts';
import SubscriptionRequestsSection from '../components/SubscriptionRequestsSection.tsx';
import { getDashboardStatsApi } from '../../dashboard/services/dashboard.api.ts';
import type { DashboardStatsResponse } from '../../dashboard/types/dashboard.type.ts';

// Register Chart.js components
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

const AdminDashboard: React.FC = () => {
  setPageTitle('System Analytics & Administration | BudgetBuddy');

  const [analytics, setAnalytics] = useState<SystemAnalyticsResponse | null>(null);
  const [personalStats, setPersonalStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [platformData, pStats] = await Promise.all([
        fetchSystemAnalyticsApi(),
        getDashboardStatsApi(null, new Date().getFullYear()).catch((e) => {
          console.error('Failed to load personal admin stats:', e);
          return null;
        }),
      ]);
      setAnalytics(platformData);
      setPersonalStats(pStats);
    } catch (err: any) {
      console.error('Failed to fetch system analytics:', err);
      setError(err?.response?.data?.detail || 'Failed to load platform analytics.');
      toast.error('Failed to load platform analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // User Role Doughnut Chart Data
  const roleChartData = {
    labels: ['Standard Users', 'Premium Members', 'Administrators'],
    datasets: [
      {
        data: analytics
          ? [
              analytics.users_by_role.user || 0,
              analytics.users_by_role.premium || 0,
              analytics.users_by_role.admin || 0,
            ]
          : [1, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(245, 158, 11, 0.8)',   // Amber / Gold
          'rgba(168, 85, 247, 0.8)',   // Purple
        ],
        borderColor: '#161c24',
        borderWidth: 3,
      },
    ],
  };

  // Financial Volume Bar Chart
  const volumeChartData = {
    labels: ['Platform Income', 'Platform Expenses', 'Total Liquidity'],
    datasets: [
      {
        label: 'Platform Volume (INR)',
        data: analytics
          ? [
              analytics.total_platform_income,
              analytics.total_platform_expenses,
              analytics.total_platform_liquidity,
            ]
          : [0, 0, 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)',  // Emerald
          'rgba(244, 63, 94, 0.75)',   // Rose
          'rgba(6, 182, 212, 0.75)',   // Cyan
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(6, 182, 212, 1)',
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  // Monthly Signups Trend Chart
  const signupLabels = analytics?.monthly_signups?.map((s) => s.month) || [];
  const signupCounts = analytics?.monthly_signups?.map((s) => s.signups) || [];

  const signupsChartData = {
    labels: signupLabels,
    datasets: [
      {
        label: 'New User Signups',
        data: signupCounts,
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
    ],
  };

  return (
    <ContentWrapper>
      <div className="flex-1 max-width mx-auto w-full py-4 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161c24] border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl shadow-lg">
              <RiShieldUserLine />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  System Analytics & Control Center
                </h1>
                <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                System-wide platform monitoring, user distribution, liquidity, and audit controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAnalytics}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RiRefreshLine className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
            >
              <RiGroupLine />
              Manage Users
            </Link>
            <Link
              to="/admin/logs"
              className="px-4 py-2 bg-[#1e252e] hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <RiFileList3Line />
              Audit Logs
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {isLoading && !analytics ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : analytics ? (
          <>
            {/* ── Admin Personal Financial Snapshot ── */}
            {personalStats && (
              <div className="bg-gradient-to-r from-purple-950/40 via-[#161c24] to-cyan-950/30 border border-purple-500/25 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <h2 className="text-base font-bold text-white">Your Personal Financial Overview (Administrator Profile)</h2>
                    </div>
                    <p className="text-xs text-gray-400">
                      Personal liquidity, year-to-date inflows, and expenditure metrics for your account.
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-auto shrink-0 flex items-center gap-1.5"
                  >
                    Open Personal Dashboard →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
                  <div className="bg-[#11161d] rounded-xl p-3 border border-white/5">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Net Balance</span>
                    <p className="text-lg font-extrabold text-white mt-0.5">{formatCurrency(personalStats.user_stats.balance)}</p>
                  </div>
                  <div className="bg-[#11161d] rounded-xl p-3 border border-white/5">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold">Incomes Logged</span>
                    <p className="text-lg font-extrabold text-emerald-400 mt-0.5">+{formatCurrency(personalStats.user_stats.income)}</p>
                  </div>
                  <div className="bg-[#11161d] rounded-xl p-3 border border-white/5">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold">Expenses Deducted</span>
                    <p className="text-lg font-extrabold text-rose-400 mt-0.5">-{formatCurrency(personalStats.user_stats.expenses)}</p>
                  </div>
                  <div className="bg-[#11161d] rounded-xl p-3 border border-white/5">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold">Net Savings</span>
                    <p className={`text-lg font-extrabold mt-0.5 ${personalStats.user_stats.savings >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {formatCurrency(personalStats.user_stats.savings)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── KPI Metrics Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all shadow-lg group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Platform Users
                    </p>
                    <p className="text-2xl font-extrabold text-white mt-1.5">
                      {analytics.total_users}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                      {analytics.verified_users} email verified
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">
                    <RiGroupLine />
                  </div>
                </div>
              </div>

              {/* Active vs Inactive */}
              <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all shadow-lg group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Active Accounts
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1.5">
                      {analytics.active_users}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {analytics.inactive_users} suspended accounts
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl group-hover:scale-110 transition-transform">
                    <RiUserFollowLine />
                  </div>
                </div>
              </div>

              {/* Platform Total Liquidity */}
              <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all shadow-lg group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Total System Liquidity
                    </p>
                    <p className="text-2xl font-extrabold text-cyan-400 mt-1.5">
                      {formatCurrency(analytics.total_platform_liquidity)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Held across linked banks</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xl group-hover:scale-110 transition-transform">
                    <RiBankCardLine />
                  </div>
                </div>
              </div>

              {/* Platform Transactions */}
              <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all shadow-lg group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      Total Transactions
                    </p>
                    <p className="text-2xl font-extrabold text-purple-400 mt-1.5">
                      {analytics.total_transactions_count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {analytics.total_budgets_created} budgets • {analytics.total_goals_created} goals
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl group-hover:scale-110 transition-transform">
                    <RiExchangeDollarLine />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Subscription Requests Management ── */}
            <SubscriptionRequestsSection onRequestProcessed={loadAnalytics} />

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Roles Breakdown Doughnut */}
              <div className="bg-[#1e252e] rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-bold text-white text-base">User Role Distribution</h3>
                  <p className="text-xs text-gray-400">Platform tier distribution</p>
                </div>
                <div className="h-56 flex items-center justify-center">
                  <Doughnut
                    data={roleChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#94a3b8', font: { size: 11 } },
                        },
                      },
                      cutout: '68%',
                    }}
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-blue-400 font-bold block text-sm">
                      {analytics.users_by_role.user || 0}
                    </span>
                    <span className="text-gray-400 text-[10px]">Basic</span>
                  </div>
                  <div>
                    <span className="text-amber-400 font-bold block text-sm">
                      {analytics.users_by_role.premium || 0}
                    </span>
                    <span className="text-gray-400 text-[10px]">Premium</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-bold block text-sm">
                      {analytics.users_by_role.admin || 0}
                    </span>
                    <span className="text-gray-400 text-[10px]">Admin</span>
                  </div>
                </div>
              </div>

              {/* Financial Volume Bar Chart */}
              <div className="lg:col-span-2 bg-[#1e252e] rounded-2xl p-5 border border-white/5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Platform Financial Flow Volume</h3>
                    <p className="text-xs text-gray-400">Total volume logged across all users</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Gross Flow: {formatCurrency(analytics.total_platform_income + analytics.total_platform_expenses)}
                  </span>
                </div>
                <div className="h-64 sm:h-72">
                  <Bar
                    data={volumeChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => ` ${formatCurrency(Number(ctx.raw))}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(255,255,255,0.05)' },
                          ticks: {
                            color: '#94a3b8',
                            callback: (v) => formatCurrency(Number(v)),
                          },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: '#94a3b8' },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Monthly Signups Line Chart ── */}
            <div className="bg-[#1e252e] rounded-2xl p-5 sm:p-6 border border-white/5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Annual User Registrations Growth</h3>
                  <p className="text-xs text-gray-400">New user signups per month</p>
                </div>
              </div>
              <div className="h-60 sm:h-64">
                <Line
                  data={signupsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ContentWrapper>
  );
};

export default AdminDashboard;
