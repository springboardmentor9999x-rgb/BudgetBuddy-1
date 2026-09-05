import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiBarChart2,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CHART_COLORS = ["#10b981", "#f59e0b", "#6366f1"];

function ChartCard({ eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg font-bold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="h-[300px] w-full">
        {children}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/admin/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Admin analytics error:", error);

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to load system analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const userStats = analytics?.users || {};
  const financial = analytics?.financial || {};

  const userDistributionData = [
    {
      name: "Normal",
      value: Number(userStats.normal || 0),
    },
    {
      name: "Premium",
      value: Number(userStats.premium || 0),
    },
    {
      name: "Admins",
      value: Number(userStats.admin || 0),
    },
  ];

  const accountStatusData = [
    {
      name: "Active",
      value: Number(userStats.active || 0),
    },
    {
      name: "Inactive",
      value: Math.max(
        0,
        Number(userStats.total || 0) -
          Number(userStats.active || 0)
      ),
    },
    {
      name: "Verified",
      value: Number(userStats.verified || 0),
    },
  ];

  const financialData = [
    {
      name: "Income",
      amount: Number(financial.total_income || 0),
    },
    {
      name: "Expenses",
      amount: Number(financial.total_expenses || 0),
    },
  ];

  const platformData = [
    {
      name: "Budgets",
      value: Number(financial.total_budgets || 0),
    },
    {
      name: "Savings Goals",
      value: Number(financial.total_savings_goals || 0),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">

          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <FiArrowLeft />
            Dashboard
          </button>

          <button
            onClick={loadAnalytics}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <FiBarChart2 />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-5 py-7 lg:px-8 lg:py-9">

        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
            Admin Analytics
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#071a2c] md:text-4xl">
            Platform insights
          </h1>

          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Detailed analytics across your Budget Buddy platform.
          </p>
        </section>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {loading && !analytics ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Loading analytics...
            </p>
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-emerald-600" />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Analytics
                </p>

                <h2 className="text-lg font-bold text-slate-900">
                  Platform insights
                </h2>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">

              <ChartCard
                eyebrow="Users"
                title="User Distribution"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell
                          key={`user-cell-${index}`}
                          fill={
                            CHART_COLORS[
                              index % CHART_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        value,
                        "Users",
                      ]}
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                eyebrow="Accounts"
                title="Account Status"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={accountStatusData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Users"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                eyebrow="Finance"
                title="Income vs Expenses"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `?${Number(value).toLocaleString("en-IN")}`,
                        "Amount",
                      ]}
                    />

                    <Bar
                      dataKey="amount"
                      name="Amount"
                      fill="#6366f1"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                eyebrow="Activity"
                title="Budgets vs Savings Goals"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={platformData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Count"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default AdminAnalytics;
