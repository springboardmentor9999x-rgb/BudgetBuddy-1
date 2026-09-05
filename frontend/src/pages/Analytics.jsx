import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiDollarSign,
  FiBarChart2,
  FiRefreshCw,
  FiTrendingUp,
  FiTarget,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import { getCompleteAnalytics } from "../services/analyticsService";
import { useAuth } from "../context/AuthContext";

function Analytics() {
  const { user, role, isPremium } = useAuth();
  console.log("ANALYTICS AUTH:", { role, isPremium, user });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCompleteAnalytics();

      setAnalytics(data);
    } catch (err) {
      console.error("Unable to fetch analytics:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* ==========================================
      HELPERS
  ========================================== */

  const formatCurrency = (value) => {
    return `$${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const getMonthName = (month) => {
    const monthNumber = Number(month);

    if (
      !monthNumber ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      return "Unknown";
    }

    return new Date(
      2026,
      monthNumber - 1,
      1
    ).toLocaleString("en-IN", {
      month: "short",
    });
  };

  /* ==========================================
      DATA
  ========================================== */

  const summary = analytics?.summary || {};

  const totalIncome = Number(
    summary.total_income || 0
  );

  const totalExpenses = Number(
    summary.total_expenses || 0
  );

  const netSavings = Number(
    summary.net_savings || 0
  );

  const monthly = Array.isArray(
    analytics?.monthly
  )
    ? analytics.monthly
    : [];

  const categories = Array.isArray(
    analytics?.categories
  )
    ? analytics.categories
    : [];

  /* ==========================================
      CHART DATA
  ========================================== */

  const monthlyChartData = monthly.map((item) => ({
    month: `${getMonthName(item.month)} ${item.year}`,
    income: Number(item.income || 0),
    expenses: Number(item.expenses || 0),
    savings: Number(item.net_savings || 0),
  }));

  const categoryChartData = categories.map(
    (item) => ({
      category: item.category,
      amount: Number(
        item.total_amount || 0
      ),
    })
  );

  /* ==========================================
      RATES
  ========================================== */

  const savingsRate =
    totalIncome > 0
      ? (netSavings / totalIncome) * 100
      : 0;

  const expenseRate =
    totalIncome > 0
      ? (totalExpenses / totalIncome) * 100
      : 0;

  const maxCategoryAmount =
    categories.length > 0
      ? Math.max(
          ...categories.map((item) =>
            Number(item.total_amount || 0)
          )
        )
      : 0;

  /* ==========================================
      TOOLTIP
  ========================================== */

  const CustomTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <p className="mb-3 text-sm font-bold text-[#071a2b]">
          {label}
        </p>

        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="text-slate-500">
              {item.name}
            </span>

            <span className="font-bold text-[#071a2b]">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-6 sm:px-7 lg:px-10">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Financial Insights
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#071a2b] sm:text-4xl">
              Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Understand your income, spending and
              savings.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

        </div>
      </header>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAnalytics}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* ==========================================
            SUMMARY CARDS
        ========================================== */}

        <section className={`grid gap-5 ${isPremium ? "md:grid-cols-3" : "md:grid-cols-2"}`}>

          {/* TOTAL INCOME */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Income
                </p>

                <p className="mt-3 text-3xl font-bold text-[#071a2b]">
                  {loading
                    ? "..."
                    : formatCurrency(
                        totalIncome
                      )}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FiArrowUpRight className="text-xl" />
              </div>

            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-emerald-500" />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Total recorded earnings
            </p>
          </motion.div>

          {/* TOTAL EXPENSES */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Expenses
                </p>

                <p className="mt-3 text-3xl font-bold text-[#071a2b]">
                  {loading
                    ? "..."
                    : formatCurrency(
                        totalExpenses
                      )}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <FiArrowDownRight className="text-xl" />
              </div>

            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-500"
                style={{
                  width: `${Math.min(
                    expenseRate,
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Total recorded spending
            </p>
          </motion.div>

          {/* NET SAVINGS */}

          {isPremium && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Net Savings
                </p>

                <p className="mt-3 text-3xl font-bold text-emerald-600">
                  {loading
                    ? "..."
                    : formatCurrency(
                        netSavings
                      )}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FiDollarSign className="text-xl" />
              </div>

            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(
                    Math.max(
                      savingsRate,
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Income minus expenses
            </p>
          </motion.div>

                  )}

        </section>        
        {isPremium && (
          <>


        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiBarChart2 className="text-xl" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#071a2b]">
                  Monthly Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track income, expenses and
                  savings over time.
                </p>
              </div>

            </div>

            <div className="hidden rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 sm:block">
              Monthly
            </div>

          </div>

          {loading ? (

            <div className="flex items-center gap-3 py-16">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

              <span className="text-sm text-slate-500">
                Loading analytics...
              </span>
            </div>

          ) : monthly.length === 0 ? (

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No monthly analytics available yet.
              </p>
            </div>

          ) : (

            <div className="mt-8 h-[320px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="incomeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={0.22}
                      />

                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="expenseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#64748b"
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="100%"
                        stopColor="#64748b"
                        stopOpacity={0}
                      />
                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      `$${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Tooltip
                    content={null}
                  />

                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#incomeGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#64748b"
                    strokeWidth={2.5}
                    fill="url(#expenseGradient)"
                  />

                </AreaChart>
              </ResponsiveContainer>

            </div>

          )}

        </section>

        {/* ==========================================
            CATEGORY + MONTHLY TABLE
        ========================================== */}

        {isPremium && (

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* CATEGORY ANALYTICS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-[#071a2b]">
                  Expense Categories
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Where your money is being spent.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <FiArrowDownRight />
              </div>

            </div>

            {loading ? (

              <div className="flex items-center gap-3 py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                <span className="text-sm text-slate-500">
                  Loading categories...
                </span>
              </div>

            ) : categories.length === 0 ? (

              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No expense category data available yet.
                </p>
              </div>

            ) : (

              <div className="mt-6">

                <div className="h-[280px] w-full">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={categoryChartData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                        tickFormatter={(value) =>
                          `$${Number(
                            value
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        }
                      />

                      <YAxis
                        type="category"
                        dataKey="category"
                        width={70}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#334155",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                        contentStyle={{
                          borderRadius: "12px",
                          border:
                            "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 25px rgba(15, 23, 42, 0.08)",
                        }}
                      />

                      <Bar
                        dataKey="amount"
                        name="Expenses"
                        fill="#10b981"
                        radius={[
                          0,
                          6,
                          6,
                          0,
                        ]}
                        barSize={22}
                      />

                    </BarChart>
                  </ResponsiveContainer>

                </div>

                {/* CATEGORY LIST */}

                <div className="mt-5 space-y-3">

                  {categories.map(
                    (item, index) => {

                      const amount =
                        Number(
                          item.total_amount ||
                            0
                        );

                      const percentage =
                        maxCategoryAmount >
                        0
                          ? (amount /
                              maxCategoryAmount) *
                            100
                          : 0;

                      return (
                        <div
                          key={`${item.category}-${index}`}
                          className="rounded-xl bg-slate-50 p-4"
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                <FiArrowDownRight />
                              </div>

                              <p className="truncate text-sm font-bold text-slate-700">
                                {item.category}
                              </p>

                            </div>

                            <p className="shrink-0 text-sm font-bold text-[#071a2b]">
                              {formatCurrency(
                                amount
                              )}
                            </p>

                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">

                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${percentage}%`,
                              }}
                              transition={{
                                duration: 0.6,
                                delay:
                                  index *
                                  0.05,
                              }}
                              className="h-full rounded-full bg-emerald-500"
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            )}

          </div>

          {/* MONTHLY TABLE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-[#071a2b]">
                  Monthly Breakdown
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Detailed monthly financial summary.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiBarChart2 />
              </div>

            </div>

            {loading ? (

              <div className="flex items-center gap-3 py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                <span className="text-sm text-slate-500">
                  Loading monthly data...
                </span>
              </div>

            ) : monthly.length === 0 ? (

              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No monthly data available.
                </p>
              </div>

            ) : (

              <div className="mt-6 space-y-3">

                {monthly.map(
                  (item, index) => {

                    const income =
                      Number(
                        item.income || 0
                      );

                    const expenses =
                      Number(
                        item.expenses ||
                          0
                      );

                    const savings =
                      Number(
                        item.net_savings ||
                          0
                      );

                    return (
                      <motion.div
                        key={`${item.year}-${item.month}-${index}`}
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.05,
                        }}
                        className="rounded-xl bg-slate-50 p-4"
                      >

                        <div className="flex items-center justify-between">

                          <div>
                            <p className="text-sm font-bold text-[#071a2b]">
                              {getMonthName(
                                item.month
                              )}{" "}
                              {item.year}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Monthly summary
                            </p>
                          </div>

                          <div className="rounded-lg bg-emerald-50 px-3 py-1.5">
                            <span className="text-sm font-bold text-emerald-600">
                              {formatCurrency(
                                savings
                              )}
                            </span>
                          </div>

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div className="rounded-lg bg-white p-3">

                            <p className="text-xs text-slate-400">
                              Income
                            </p>

                            <p className="mt-1 text-sm font-bold text-emerald-600">
                              {formatCurrency(
                                income
                              )}
                            </p>

                          </div>

                          <div className="rounded-lg bg-white p-3">

                            <p className="text-xs text-slate-400">
                              Expenses
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {formatCurrency(
                                expenses
                              )}
                            </p>

                          </div>

                        </div>

                      </motion.div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

                )}

        {/* ==========================================
            FINANCIAL PERFORMANCE
        ========================================== */}

        {isPremium && !loading && analytics && (

          <section className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* SAVINGS PERFORMANCE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#071a2b]">
                    Savings Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your current income-to-savings position.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiTrendingUp />
                </div>

              </div>

              <div className="mt-7">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-xs font-medium text-slate-400">
                      Savings Rate
                    </p>

                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                      {savingsRate.toFixed(
                        1
                      )}
                      %
                    </p>

                  </div>

                  <p className="text-sm font-semibold text-slate-400">
                    {formatCurrency(
                      netSavings
                    )}{" "}
                    saved
                  </p>

                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${Math.min(
                        Math.max(
                          savingsRate,
                          0
                        ),
                        100
                      )}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-emerald-500"
                  />

                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Percentage of your income that
                  remains after expenses.
                </p>

              </div>

            </div>

            {/* SPENDING PERFORMANCE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#071a2b]">
                    Spending Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Percentage of income used for expenses.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FiTarget />
                </div>

              </div>

              <div className="mt-7">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-xs font-medium text-slate-400">
                      Expense Rate
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#071a2b]">
                      {expenseRate.toFixed(
                        1
                      )}
                      %
                    </p>

                  </div>

                  <p className="text-sm font-semibold text-slate-400">
                    {formatCurrency(
                      totalExpenses
                    )}{" "}
                    spent
                  </p>

                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${Math.min(
                        Math.max(
                          expenseRate,
                          0
                        ),
                        100
                      )}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-slate-500"
                  />

                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Percentage of your income that
                  has been spent.
                </p>

              </div>

            </div>

          </section>

        )}        
          </>
        )}



        <footer className="mt-10 border-t border-slate-200 py-6">

          <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Budget Buddy - Analytics
            </p>

            <p>
              Understand your money. Plan smarter.
            </p>

          </div>

        </footer>

      </main>

    </div>
  );
}

export default Analytics;

