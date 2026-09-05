import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiDollarSign,
  FiTarget,
  FiPieChart,
  FiTrendingDown,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import api from "../services/api";

function AdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/admin/users/${userId}`);
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.detail ||
            "Unable to load user details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Loading user details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-sm font-medium text-red-500">{error}</p>

        <button
          onClick={() => navigate("/admin")}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to Admin
        </button>
      </div>
    );
  }

  const user = data?.user;
  const summary = data?.summary;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1450px] items-center gap-4 px-5 py-5 lg:px-8">
          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <FiArrowLeft />
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Admin
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              User Details
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-5 py-7 lg:px-8 lg:py-9">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-600">
                {(user?.email || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  User #{user?.id}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {user?.role}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  user?.is_active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {user?.is_active ? "Active" : "Inactive"}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  user?.is_verified
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {user?.is_verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={FiTrendingUp}
            label="Total Income"
            value={`₹${Number(
              summary?.total_income || 0
            ).toLocaleString("en-IN")}`}
          />

          <Stat
            icon={FiTrendingDown}
            label="Total Expenses"
            value={`₹${Number(
              summary?.total_expenses || 0
            ).toLocaleString("en-IN")}`}
          />

          <Stat
            icon={FiPieChart}
            label="Budgets"
            value={summary?.budget_count || 0}
          />

          <Stat
            icon={FiTarget}
            label="Savings Goals"
            value={summary?.savings_goal_count || 0}
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <DataCard
            title="Expenses"
            icon={FiDollarSign}
            items={data?.expenses}
            type="expense"
          />

          <DataCard
            title="Income"
            icon={FiTrendingUp}
            items={data?.income}
            type="income"
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <DataCard
            title="Budgets"
            icon={FiPieChart}
            items={data?.budgets}
            type="budget"
          />

          <DataCard
            title="Savings Goals"
            icon={FiTarget}
            items={data?.savings_goals}
            type="savings"
          />
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-600" />

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DataCard({ title, icon: Icon, items = [], type }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <Icon className="text-emerald-600" />
        </div>

        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400">
            {items.length} record{items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">
            No records found.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.category ||
                      item.name ||
                      item.description ||
                      "Record"}
                  </p>

                  {item.description && (
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {item.description}
                    </p>
                  )}

                  {item.date && (
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>

                {type === "savings" ? (
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ₹{Number(
                        item.current_amount || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-slate-400">
                      of ₹{Number(
                        item.target_amount || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ) : type === "budget" ? (
                  <p className="text-sm font-bold text-slate-900">
                    ₹{Number(
                      item.amount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                ) : (
                  <p
                    className={`text-sm font-bold ${
                      type === "expense"
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {type === "expense" ? "-" : "+"}₹
                    {Number(
                      item.amount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserDetails;
