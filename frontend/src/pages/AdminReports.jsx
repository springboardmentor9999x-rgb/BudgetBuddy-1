import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiDollarSign,
  FiDownload,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CHART_COLORS = ["#10b981", "#f59e0b", "#6366f1", "#0ea5e9", "#ef4444"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function StatCard({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#071a2b]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            tones[tone] || tones.slate
          }`}
        >
          <Icon />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#071a2b]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}

function AdminReports() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/admin/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Admin reports error:", error);

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to load the overall system report."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadExcelReport = async () => {
    try {
      const response = await api.get(
        "/admin/reports/excel",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Budget_Buddy_Overall_System_Report.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Unable to download Excel report:", error);
      alert(
        error.response?.data?.detail ||
          "Unable to download the Excel report."
      );
    }
  };
  const downloadReport = async () => {
    try {
      const response = await api.get(
        "/admin/reports/download",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Budget_Buddy_Overall_System_Report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report download error:", error);

      alert(
        error.response?.data?.detail ||
          "Unable to download the overall system report."
      );
    }
  };
  useEffect(() => {
    loadReport();
  }, []);

  const users = analytics?.users || {};
  const financial = analytics?.financial || {};
  const charts = analytics?.charts || {};

  const netBalance =
    Number(financial.total_income || 0) -
    Number(financial.total_expenses || 0);

  const savingsContribution =
    Number(financial.savings_current || 0);

  const monthlyFinancial = charts.monthly_financial || [];
  const monthlyUsers = charts.monthly_users || [];
  const expenseCategories = charts.expense_categories || [];
  const incomeCategories = charts.income_categories || [];
  const savingsStatus = charts.savings_status || [];

  const userDistribution = [
    { name: "Normal", value: Number(users.normal || 0) },
    { name: "Premium", value: Number(users.premium || 0) },
    { name: "Admin", value: Number(users.admin || 0) },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
            Loading overall system report...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                Admin
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#071a2b]">
                Overall System Report
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                System-wide users, finances, budgets, savings and analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={downloadReport}
              className="flex items-center gap-2 rounded-xl bg-[#071a2b] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FiDownload />
              Download Report
            </button>

            <button
              type="button"
              onClick={downloadExcelReport}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FiDownload />
              Excel
            </button>
            <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 sm:flex">
              <FiCheckCircle />
              Admin-only report
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-bold text-red-600">
              Unable to load report
            </p>
            <p className="mt-1 text-sm text-red-500">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={loadReport}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!errorMessage && (
          <>
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Users"
                value={users.total || 0}
                icon={FiUsers}
                tone="blue"
              />
              <StatCard
                label="Normal Users"
                value={users.normal || 0}
                icon={FiUsers}
              />
              <StatCard
                label="Premium Users"
                value={users.premium || 0}
                icon={FiTrendingUp}
                tone="emerald"
              />
              <StatCard
                label="Admin Users"
                value={users.admin || 0}
                icon={FiUsers}
                tone="amber"
              />

              <StatCard
                label="Active Users"
                value={users.active || 0}
                icon={FiCheckCircle}
                tone="emerald"
              />
              <StatCard
                label="Inactive Users"
                value={users.inactive || 0}
                icon={FiUsers}
              />
              <StatCard
                label="Verified Users"
                value={users.verified || 0}
                icon={FiCheckCircle}
                tone="emerald"
              />
              <StatCard
                label="Unverified Users"
                value={users.unverified || 0}
                icon={FiUsers}
                tone="amber"
              />
            </section>

            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Overall Income"
                value={formatCurrency(financial.total_income)}
                icon={FiTrendingUp}
                tone="emerald"
              />
              <StatCard
                label="Overall Expenses"
                value={formatCurrency(financial.total_expenses)}
                icon={FiDollarSign}
              />
              <StatCard
                label="Net Balance"
                value={formatCurrency(netBalance)}
                icon={FiDollarSign}
                tone={netBalance >= 0 ? "emerald" : "amber"}
              />
              <StatCard
                label="Savings Contributions"
                value={formatCurrency(savingsContribution)}
                icon={FiTarget}
                tone="emerald"
              />

              <StatCard
                label="Total Budgets"
                value={financial.total_budgets || 0}
                icon={FiBarChart2}
              />
              <StatCard
                label="Savings Goals"
                value={financial.total_savings_goals || 0}
                icon={FiTarget}
                tone="emerald"
              />
              <StatCard
                label="Savings Target"
                value={formatCurrency(financial.savings_target)}
                icon={FiTarget}
              />
              <StatCard
                label="Current Savings"
                value={formatCurrency(financial.savings_current)}
                icon={FiTrendingUp}
                tone="emerald"
              />
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <SectionCard
                title="Monthly Financial Activity"
                description="System-wide income and expenses for the last six months."
              >
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFinancial}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#10b981" />
                      <Bar dataKey="expenses" name="Expenses" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="User Registration Activity"
                description="New users registered during the last six months."
              >
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyUsers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="users"
                        name="Registrations"
                        fill="#10b981"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="User Distribution"
                description="Current system users by role."
              >
                {userDistribution.length === 0 ? (
                  <p className="py-20 text-center text-sm text-slate-400">
                    No user data available.
                  </p>
                ) : (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={105}
                        >
                          {userDistribution.map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                CHART_COLORS[
                                  index % CHART_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Savings Goal Status"
                description="Distribution of savings goals by current status."
              >
                {savingsStatus.length === 0 ? (
                  <p className="py-20 text-center text-sm text-slate-400">
                    No savings goal data available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savingsStatus.map((item, index) => (
                      <div
                        key={`${item.status}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                      >
                        <span className="text-sm font-bold capitalize text-slate-700">
                          {item.status}
                        </span>
                        <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-[#071a2b] shadow-sm">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SectionCard
                title="Expense Categories"
                description="System-wide expense distribution."
              >
                <div className="space-y-3">
                  {expenseCategories.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No expense category data available.
                    </p>
                  ) : (
                    expenseCategories.map((item, index) => (
                      <div
                        key={`${item.category}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-[#071a2b]">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Income Categories"
                description="System-wide income distribution."
              >
                <div className="space-y-3">
                  {incomeCategories.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No income category data available.
                    </p>
                  ) : (
                    incomeCategories.map((item, index) => (
                      <div
                        key={`${item.category}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>

            <footer className="mt-10 border-t border-slate-200 py-6">
              <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>Budget Buddy - Overall System Report</p>
                <p>Admin system-wide analytics and reporting.</p>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminReports;


