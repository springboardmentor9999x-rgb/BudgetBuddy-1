import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiDownload,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiFileText,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { getReport, downloadReportPdf, downloadReportExcel } from "../services/reportsService";
import { useAuth } from "../context/AuthContext";


// ==========================================
// HELPERS
// ==========================================

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatPeriodLabel = (
  period,
  startDate,
  endDate
) => {
  if (period === "day") {
    return formatDate(startDate);
  }

  if (period === "week") {
    return `${formatDate(startDate)} – ${formatDate(
      endDate
    )}`;
  }

  if (period === "month") {
    const date = new Date(startDate);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }
  }

  if (period === "custom") {
    return `${formatDate(startDate)} – ${formatDate(
      endDate
    )}`;
  }

  return "Selected period";
};


// ==========================================
// PIE COLORS
// ==========================================

const CHART_COLORS = [
  "#10b981",
  "#0f766e",
  "#64748b",
  "#334155",
  "#14b8a6",
  "#475569",
  "#059669",
  "#94a3b8",
];


// ==========================================
// REPORTS
// ==========================================

function Reports() {
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("month");

  const [customStartDate, setCustomStartDate] =
    useState("");

  const [customEndDate, setCustomEndDate] =
    useState("");

  const [report, setReport] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const [downloadingPdf, setDownloadingPdf] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // FETCH REPORT
  // ==========================================

  const fetchReport = useCallback(
    async (
      selectedPeriod = period,
      startDate = customStartDate,
      endDate = customEndDate
    ) => {
      try {
        setLoading(true);
        setError("");

        if (
          selectedPeriod === "custom" &&
          (!startDate || !endDate)
        ) {
          setReport(null);
          setLoading(false);
          return;
        }

        if (
          selectedPeriod === "custom" &&
          startDate > endDate
        ) {
          setReport(null);
          setError(
            "Start date cannot be after the end date."
          );
          setLoading(false);
          return;
        }

        const data = await getReport({
          period: selectedPeriod,
          startDate:
            selectedPeriod === "custom"
              ? `${startDate}T00:00:00`
              : null,
          endDate:
            selectedPeriod === "custom"
              ? `${endDate}T00:00:00`
              : null,
        });

        setReport(data);
      } catch (err) {
        console.error(
          "Failed to load report:",
          err
        );

        setReport(null);

        setError(
          err?.response?.data?.detail ||
            "Unable to load the financial report."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      period,
      customStartDate,
      customEndDate,
    ]
  );


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchReport("month");
  }, []);


  // ==========================================
  // PERIOD CHANGE
  // ==========================================

  const handlePeriodChange = (value) => {
    setPeriod(value);

    if (value !== "custom") {
      fetchReport(value);
    } else {
      setReport(null);
    }
  };


  // ==========================================
  // CUSTOM REPORT
  // ==========================================

  const handleCustomApply = () => {
    fetchReport(
      "custom",
      customStartDate,
      customEndDate
    );
  };


  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);

      const response = await downloadReportExcel({
        period,
        startDate: customStartDate,
        endDate: customEndDate,
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `budget_buddy_${period}_report.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Excel report downloaded successfully.");
    } catch (err) {
      console.error("Unable to download Excel:", err);
      toast.error("Unable to download Excel report.");
    } finally {
      setDownloadingExcel(false);
    }
  };
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);

      const response = await downloadReportPdf({
        period,
        startDate:
          period === "custom"
            ? `${customStartDate}T00:00:00`
            : null,
        endDate:
          period === "custom"
            ? `${customEndDate}T00:00:00`
            : null,
      });

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `budget_buddy_${period}_report.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Financial report PDF downloaded successfully."
      );
    } catch (err) {
      console.error(
        "Failed to download report PDF:",
        err
      );

      toast.error(
        "Unable to download the financial report PDF."
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ==========================================
  // DATA
  // ==========================================

  const summary = report?.summary || {
    total_income: 0,
    total_expenses: 0,
    net_balance: 0,
    savings: 0,
  };

  const categories =
    report?.expense_categories || [];

  const transactions =
    report?.transactions || [];

  const verification =
    report?.verification || {
      income_count: 0,
      expense_count: 0,
      transaction_count: 0,
    };


  // ==========================================
  // CATEGORY CHART DATA
  // ==========================================

  const categoryChartData = useMemo(
    () =>
      categories.map((item) => ({
        name: item.category,
        value: Number(
          item.total_amount || 0
        ),
      })),
    [categories]
  );


  // ==========================================
  // SAVINGS CONTRIBUTIONS
  // ==========================================

  const savingsContributions =
    useMemo(
      () =>
        transactions
          .filter(
            (transaction) =>
              transaction.type ===
                "expense" &&
              transaction.payment_method ===
                "Savings Goal"
          )
          .reduce(
            (total, transaction) =>
              total +
              Number(
                transaction.amount || 0
              ),
            0
          ),
      [transactions]
    );


  const regularExpenses =
    Math.max(
      Number(
        summary.total_expenses || 0
      ) -
        savingsContributions,
      0
    );


  // ==========================================
  // PERIOD LABEL
  // ==========================================

  const periodLabel =
    report
      ? formatPeriodLabel(
          report.period,
          report.start_date,
          report.end_date
        )
      : "Selected period";


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-6 sm:px-7 lg:px-10 lg:py-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FiFileText className="text-xl" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Financial Reports
                </p>

                <h1 className="mt-1 text-2xl font-bold text-[#071a2b] sm:text-3xl">
                  Reports
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Review and verify your finances for any period.
                </p>
              </div>

            </div>


            <div className="flex flex-wrap items-center gap-3">

              <button type="button" onClick={() => navigate("/dashboard")} title="Back to Dashboard" className="fixed left-5 top-5 z-50 flex h-8 w-8 items-center justify-center text-slate-700 transition hover:text-emerald-600"><FiArrowLeft className="text-xl" /></button>

              <button
                type="button"
                onClick={() =>
                  fetchReport(
                    period,
                    customStartDate,
                    customEndDate
                  )
                }
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={!report || downloadingExcel}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiDownload
                  className={
                    downloadingExcel
                      ? "animate-pulse"
                      : ""
                  }
                />
                {downloadingExcel
                  ? "Generating Excel..."
                  : "Download Excel"}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!report || downloadingPdf}
                className="flex items-center gap-2 rounded-xl bg-[#071a2b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b263d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiDownload
                  className={
                    downloadingPdf
                      ? "animate-pulse"
                      : ""
                  }
                />

                {downloadingPdf
                  ? "Generating PDF..."
                  : "Download PDF"}
              </button>

            </div>

          </div>


          {/* ====================================
              PERIOD FILTER
          ==================================== */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex flex-wrap gap-2">

                {[
                  ["day", "Day"],
                  ["week", "Week"],
                  ["month", "Month"],
                  ["custom", "Custom"],
                ].map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        handlePeriodChange(
                          value
                        )
                      }
                      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                        period === value
                          ? "bg-[#071a2b] text-white shadow-sm"
                          : "bg-white text-slate-600 hover:text-emerald-600"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}

              </div>


              {period === "custom" && (

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">
                      From
                    </span>

                    <input
                      type="date"
                      value={
                        customStartDate
                      }
                      onChange={(event) =>
                        setCustomStartDate(
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">
                      To
                    </span>

                    <input
                      type="date"
                      value={
                        customEndDate
                      }
                      onChange={(event) =>
                        setCustomEndDate(
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={
                      handleCustomApply
                    }
                    disabled={
                      !customStartDate ||
                      !customEndDate ||
                      loading
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiCalendar />

                    Apply
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </header>


      {/* ========================================
          MAIN
      ======================================== */}

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-red-500">
              <FiTarget />
            </div>

            <div>
              <p className="text-sm font-bold text-red-600">
                Unable to load report
              </p>

              <p className="mt-1 text-sm text-red-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchReport(
                    period,
                    customStartDate,
                    customEndDate
                  )
                }
                className="mt-3 text-sm font-bold text-red-700 underline"
              >
                Try again
              </button>
            </div>

          </div>

        )}


        {/* ======================================
            REPORT META
        ====================================== */}

        {!error && !loading && report && (

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Report period
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#071a2b]">
                {periodLabel}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <FiCheckCircle className="text-emerald-500" />
              Data verified from recorded transactions
            </div>

          </div>

        )}


        {/* ======================================
            SUMMARY CARDS
        ====================================== */}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* INCOME */}

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

                <p className="mt-3 text-2xl font-bold text-[#071a2b] sm:text-3xl">
                  {loading
                    ? "..."
                    : formatCurrency(
                        summary.total_income
                      )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiArrowUpRight />
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              {verification.income_count} income transaction
              {verification.income_count === 1
                ? ""
                : "s"} in this period.
            </p>

          </motion.div>


          {/* OUTFLOW */}

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
                  Total Outflow
                </p>

                <p className="mt-3 text-2xl font-bold text-[#071a2b] sm:text-3xl">
                  {loading
                    ? "..."
                    : formatCurrency(
                        summary.total_expenses
                      )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiArrowDownRight />
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              Includes regular expenses and savings contributions.
            </p>

          </motion.div>


          {/* NET BALANCE */}

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
                  Net Balance
                </p>

                <p
                  className={`mt-3 text-2xl font-bold sm:text-3xl ${
                    Number(
                      summary.net_balance
                    ) >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {loading
                    ? "..."
                    : formatCurrency(
                        summary.net_balance
                      )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiDollarSign />
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              Income minus total outflow.
            </p>

          </motion.div>


          {/* SAVINGS */}

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
              delay: 0.15,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Savings
                </p>

                <p className="mt-3 text-2xl font-bold text-emerald-600 sm:text-3xl">
                  {loading
                    ? "..."
                    : formatCurrency(
                        summary.savings
                      )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiTrendingUp />
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              Current-period net savings position.
            </p>

          </motion.div>

        </section>


        {/* ======================================
            MAIN ANALYTICS GRID
        ====================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* CATEGORY CHART */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiBarChart2 />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#071a2b]">
                    Expense Breakdown
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    See how total outflow is distributed.
                  </p>
                </div>

              </div>

              <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                {categories.length} categor
                {categories.length === 1
                  ? "y"
                  : "ies"}
              </span>

            </div>


            {loading ? (

              <div className="flex items-center gap-3 py-20">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                <span className="text-sm text-slate-500">
                  Loading report...
                </span>

              </div>

            ) : categories.length === 0 ? (

              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">

                <p className="text-sm font-semibold text-slate-600">
                  No expense data for this period.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another date range.
                </p>

              </div>

            ) : (

              <div className="mt-5">

                <div className="h-[290px]">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>

                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={105}
                        paddingAngle={3}
                        strokeWidth={0}
                      >

                        {categoryChartData.map(
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                        contentStyle={{
                          borderRadius:
                            "12px",
                          border:
                            "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 25px rgba(15, 23, 42, 0.08)",
                        }}
                      />

                    </PieChart>
                  </ResponsiveContainer>

                </div>


                <div className="space-y-3">

                  {categories.map(
                    (item, index) => (
                      <div
                        key={`${item.category}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ],
                            }}
                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-700">
                              {item.category}
                            </p>

                            <p className="text-xs text-slate-400">
                              {item.transaction_count} transaction
                              {item.transaction_count === 1
                                ? ""
                                : "s"}
                            </p>

                          </div>

                        </div>

                        <p className="shrink-0 text-sm font-bold text-[#071a2b]">
                          {formatCurrency(
                            item.total_amount
                          )}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

            )}

          </div>


          {/* ALLOCATION SUMMARY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiTarget />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#071a2b]">
                  Money Allocation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Understand where your outflow went.
                </p>
              </div>

            </div>


            <div className="mt-7 space-y-4">

              <div className="rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Regular Expenses
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#071a2b]">
                      {formatCurrency(
                        regularExpenses
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                    <FiArrowDownRight />
                  </div>

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Spending recorded as normal expenses.
                </p>

              </div>


              <div className="rounded-2xl bg-emerald-50 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Savings Contributions
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                      {formatCurrency(
                        savingsContributions
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <FiTrendingUp />
                  </div>

                </div>

                <p className="mt-2 text-xs text-emerald-600/70">
                  Money allocated toward your savings goals.
                </p>

              </div>


              <div className="border-t border-slate-200 pt-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Total Outflow
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#071a2b]">
                      {formatCurrency(
                        summary.total_expenses
                      )}
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-slate-400">
                    Regular + Savings
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            TRANSACTIONS
        ====================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <FiFileText />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#071a2b]">
                  Transaction Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Every recorded transaction included in this report.
                </p>
              </div>

            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500">
              {verification.transaction_count} total
            </div>

          </div>


          {loading ? (

            <div className="flex items-center gap-3 p-10">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

              <span className="text-sm text-slate-500">
                Loading transactions...
              </span>

            </div>

          ) : transactions.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <FiFileText />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-600">
                No transactions found.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                There is no financial activity in this period.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Account
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Amount
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-slate-100">

                  {transactions.map(
                    (transaction) => {

                      const isIncome =
                        transaction.type ===
                        "income";

                      const isSavings =
                        transaction.type ===
                          "expense" &&
                        transaction.payment_method ===
                          "Savings Goal";

                      return (
                        <tr
                          key={`${transaction.type}-${transaction.id}`}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
                            {formatDate(
                              transaction.date
                            )}
                          </td>


                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                                isIncome
                                  ? "bg-emerald-50 text-emerald-600"
                                  : isSavings
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isIncome
                                ? "Income"
                                : isSavings
                                ? "Savings"
                                : "Expense"}
                            </span>

                          </td>


                          <td className="px-6 py-4">

                            <p className="text-sm font-semibold text-slate-700">
                              {isSavings
                                ? "Savings Goal"
                                : transaction.category ||
                                  "Other"}
                            </p>

                            {isSavings && (
                              <p className="mt-1 text-xs text-emerald-600">
                                Contribution
                              </p>
                            )}

                          </td>


                          <td className="max-w-[320px] px-6 py-4">

                            <p className="truncate text-sm text-slate-600">
                              {transaction.description ||
                                "No description"}
                            </p>

                          </td>


                          <td className="px-6 py-4 text-sm font-medium text-slate-500">
                            #{transaction.account_id ?? "—"}
                          </td>


                          <td
                            className={`whitespace-nowrap px-6 py-4 text-right text-sm font-bold ${
                              isIncome
                                ? "text-emerald-600"
                                : "text-slate-700"
                            }`}
                          >
                            {isIncome
                              ? "+"
                              : "-"}
                            {formatCurrency(
                              transaction.amount
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* ======================================
            VERIFICATION
        ====================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiCheckCircle />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#071a2b]">
                Report Verification
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Use these counts to verify the report against your recorded transactions.
              </p>
            </div>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Income Transactions
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {verification.income_count}
              </p>

            </div>


            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Expense Transactions
              </p>

              <p className="mt-2 text-2xl font-bold text-[#071a2b]">
                {verification.expense_count}
              </p>

            </div>


            <div className="rounded-xl bg-emerald-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Total Transactions
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {verification.transaction_count}
              </p>

            </div>

          </div>

        </section>


        {/* ======================================
            FOOTER
        ====================================== */}

        <footer className="mt-10 border-t border-slate-200 py-6">

          <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Budget Buddy • Reports
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

export default Reports;






















