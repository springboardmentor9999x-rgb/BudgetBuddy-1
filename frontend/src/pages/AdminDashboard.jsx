import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiDownload,
  FiCreditCard,
  FiBell,
  FiEye,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPieChart,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiX,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CHART_COLORS = ["#10b981", "#f59e0b", "#6366f1"];

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
  trendType = "up",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-slate-400">{description}</p>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
              trendType === "down"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {trendType === "down" ? <FiTrendingDown /> : <FiTrendingUp />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

const commonSidebarItems = [
  { label: "Dashboard", icon: FiHome, path: "/dashboard" },
  { label: "Bank Accounts", icon: FiDollarSign, path: "/accounts" },
  { label: "Analytics", icon: FiBarChart2, path: "#analytics" },
  { label: "Reports", icon: FiDownload, path: "/reports" },
  { label: "Income", icon: FiTrendingUp, path: "/income" },
  { label: "Expenses", icon: FiTrendingDown, path: "/expenses" },
  { label: "Budgets", icon: FiTarget, path: "/budgets" },
  { label: "Savings Goals", icon: FiTarget, path: "/savings-goals" },
];
function ChartCard({ eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <div className="h-[300px] w-full">{children}</div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [premiumRequests, setPremiumRequests] = useState([]);
  const [premiumRequestsLoading, setPremiumRequestsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const pageSize = 5;

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

  const loadUsers = async () => {
    try {
      setUsersLoading(true);

      const response = await api.get("/admin/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Admin users error:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadPremiumRequests = async () => {
    try {
      setPremiumRequestsLoading(true);
      const response = await api.get("/admin/premium-requests");
      setPremiumRequests(response.data || []);
    } catch (error) {
      console.error("Premium requests error:", error);
    } finally {
      setPremiumRequestsLoading(false);
    }
  };
  const handlePremiumDecision = async (userId, action) => {
    try {
      setActionLoading(`premium-${userId}-${action}`);

      await api.put(`/admin/premium-requests/${userId}/${action}`);

      await loadPremiumRequests();
      await loadUsers();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          `Unable to ${action} Premium request.`
      );
    } finally {
      setActionLoading(null);
    }
  };
  const refreshAll = async () => {
    await Promise.all([loadAnalytics(), loadUsers(), loadPremiumRequests()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !query ||
        item.email?.toLowerCase().includes(query) ||
        String(item.id).includes(query);

      const matchesRole =
        roleFilter === "all" || item.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  const visibleUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications/");
        setNotifications(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        console.error("Unable to fetch notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);


  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const handleMarkNotificationAsRead = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      const response = await api.patch(
        `/notifications/${notification.id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? response.data : item
        )
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }
  };

  const updateRole = async (userId, role) => {
    try {
      setActionLoading(`role-${userId}`);

      await api.put(
        `/admin/users/${userId}/role`,
        null,
        { params: { role } }
      );

      await refreshAll();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Unable to update user role."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (userId, isActive) => {
    try {
      setActionLoading(`status-${userId}`);

      await api.put(
        `/admin/users/${userId}/status`,
        null,
        { params: { is_active: isActive } }
      );

      await refreshAll();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Unable to update account status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const goTo = (path) => {
    setMobileMenu(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="text-sm font-medium text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
          <FiShield className="h-8 w-8 text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load Admin Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {errorMessage}
          </p>

          <button
            onClick={refreshAll}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userStats = analytics?.users || {};
  const financial = analytics?.financial || {};

  const monthlyFinancialData =
    analytics?.charts?.monthly_financial || [];

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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[270px] bg-[#061b2b] transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-black text-white">
                B
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  Budget Buddy
                </h1>
                <p className="text-xs text-slate-400">
                  Your money, simplified
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3">

            <div className="space-y-1">

              {commonSidebarItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={item.label === "Dashboard"}
                  onClick={() => {
                    if (item.label === "Analytics") {
                      goTo("/dashboard");

                      setTimeout(() => {
                        const sections = document.querySelectorAll("section");

                        for (const section of sections) {
                          if (section.innerText.includes("Financial Analytics")) {
                            section.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            break;
                          }
                        }
                      }, 100);

                      return;
                    }

                    goTo(item.path);
                  }}
                />
              ))}

            </div>

            <p className="mb-2 mt-2 px-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Admin Panel
            </p>

            <div className="space-y-1">

              <SidebarItem
                icon={FiUsers}
                label="User Management"
                onClick={() => goTo("/admin/users")}
              />

              <SidebarItem
                icon={FiDownload}
                label="Admin Reports"
                onClick={() => goTo("/admin/reports")}
              />

            </div>

          </div>
          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
                  {(user?.full_name || user?.email || "A")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {user?.full_name || "Administrator"}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* MAIN */}
      <main className="min-w-0 flex-1">

        <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 lg:hidden"
            >
              <FiMenu />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={refreshAll}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:flex"
              >
                <FiRefreshCw
                  className={usersLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={refreshAll}
                className="rounded-xl bg-slate-900 p-3 text-white shadow-sm hover:bg-slate-800 sm:hidden"
              >
                <FiRefreshCw />
              </button>
              <button
                onClick={() => navigate("/accounts")}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 lg:flex"
              >
                <FiCreditCard />
                Bank Accounts
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open notifications"
                  onClick={() =>
                    setNotificationOpen((current) => !current)
                  }
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
                >
                  <FiBell className="text-xl" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              </div>
              {notificationOpen && (
                <div className="absolute right-0 top-14 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#071a2b]">Notifications</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {unreadNotificationCount > 0
                          ? `${unreadNotificationCount} unread`
                          : "All caught up"}
                      </p>
                    </div>
                    <FiBell className="text-emerald-600" />
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="flex items-center justify-center gap-3 px-5 py-10">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
                        <span className="text-sm text-slate-500">
                          Loading notifications...
                        </span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <FiBell className="mx-auto text-2xl text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          No notifications
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          New alerts and updates will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            handleMarkNotificationAsRead(notification)
                          }
                          className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                            notification.is_read
                              ? "bg-white"
                              : "bg-emerald-50/60"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              notification.is_read
                                ? "bg-slate-100 text-slate-400"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            <FiBell className="text-xl" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className={`text-sm leading-5 ${
                                  notification.is_read
                                    ? "font-medium text-slate-600"
                                    : "font-bold text-slate-700"
                                }`}
                              >
                                {notification.message}
                              </p>

                              {!notification.is_read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                              )}
                            </div>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {notification.created_at
                                ? new Date(
                                    notification.created_at
                                  ).toLocaleString("en-IN")
                                : ""}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Admin
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1450px] px-5 py-7 lg:px-8 lg:py-9">

          {/* HERO */}
          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
              Admin Dashboard
            </p>

            <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#071a2c] md:text-4xl">
                  Welcome back,{" "}
                  {user?.full_name?.split(" ")[0] || "Admin"}
                </h1>

                <p className="mt-2 text-sm text-slate-500 md:text-base">
                  Here's what's happening across your Budget Buddy platform.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                System healthy
              </div>
            </div>
          </section>

          {/* USER STATISTICS */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Premium Access Requests
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Review and manage users requesting Premium access.
                </p>
              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                {premiumRequests.length} Pending
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {premiumRequestsLoading ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Loading Premium requests...
                </div>
              ) : premiumRequests.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No pending Premium Access requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {premiumRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {request.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          User ID: {request.id} - Requesting Premium Access
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handlePremiumDecision(request.id, "approve")
                          }
                          disabled={
                            actionLoading ===
                              `premium-${request.id}-approve` ||
                            actionLoading ===
                              `premium-${request.id}-reject`
                          }
                          className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          `premium-${request.id}-approve`
                            ? "Approving..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePremiumDecision(request.id, "reject")
                          }
                          disabled={
                            actionLoading ===
                              `premium-${request.id}-approve` ||
                            actionLoading ===
                              `premium-${request.id}-reject`
                          }
                          className="rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          `premium-${request.id}-reject`
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FiUsers className="text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                User Statistics
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={FiUsers}
                label="Total Users"
                value={userStats.total}
                description="All registered users"
                trend="+12.5%"
              />

              <StatCard
                icon={FiUserCheck}
                label="Normal Users"
                value={userStats.normal}
                description="Standard accounts"
                trend="+8.3%"
              />

              <StatCard
                icon={FiShield}
                label="Premium Users"
                value={userStats.premium}
                description="Premium accounts"
                trend="+25.0%"
              />

              <StatCard
                icon={FiShield}
                label="Admins"
                value={userStats.admin}
                description="Administrator accounts"
                trend="0%"
                trendType="down"
              />
            </div>
          </section>

          {/* ACCOUNT + FINANCIAL */}
          <section id="analytics" className="mt-8 grid gap-5 xl:grid-cols-12">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Account Status
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Platform activity
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <FiActivity className="text-emerald-600" />
                    </div>

                    <span className="text-xs font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Active Users
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {userStats.active ?? 0}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          userStats.total
                            ? Math.min(
                                100,
                                (userStats.active /
                                  userStats.total) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <FiUserCheck className="text-blue-600" />
                    </div>

                    <span className="text-xs font-semibold text-blue-600">
                      Verified
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Verified Users
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {userStats.verified ?? 0}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          userStats.total
                            ? Math.min(
                                100,
                                (userStats.verified /
                                  userStats.total) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
      <FiDollarSign className="h-5 w-5 text-emerald-600" />
    </div>

    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
        System Financial Overview
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
        Platform finances
      </h2>

      <p className="mt-0.5 text-xs text-slate-400">
        Financial activity across all users
      </p>
    </div>
  </div>

  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-600">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    Across all users
  </div>
</div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">

                {/* TOTAL INCOME */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <FiDollarSign className="h-5 w-5 text-emerald-600" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      INCOME
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Total Income
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {"\u20B9"}{Number(financial.total_income || 0).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-emerald-600">
                    Recorded income
                  </p>
                </div>

                {/* TOTAL EXPENSES */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                      <FiDollarSign className="h-5 w-5 text-red-500" />
                    </div>

                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-500">
                      EXPENSE
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Total Expenses
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {"\u20B9"}{Number(financial.total_expenses || 0).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-red-500">
                    Recorded spending
                  </p>
                </div>

                {/* TOTAL BUDGETS */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <FiBarChart2 className="h-5 w-5 text-blue-600" />
                    </div>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                      BUDGET
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Total Budgets
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {financial.total_budgets ?? 0}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-blue-600">
                    Created budgets
                  </p>
                </div>

                {/* SAVINGS GOALS */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                      <FiTarget className="h-5 w-5 text-violet-600" />
                    </div>

                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-600">
                      GOALS
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Savings Goals
                  </p>

                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {financial.total_savings_goals ?? 0}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-violet-600">
                    Created goals
                  </p>
                </div>

              </div>
            </div>
          </section>



          {/* ADMIN ANALYTICS CHARTS */}
          <section className="mt-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <FiPieChart className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Analytics
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  Platform Insights
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  System-wide analytics across all users
                </p>
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
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell
                          key={`user-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>                </ResponsiveContainer>
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
                        `Rs. ${Number(value).toLocaleString("en-IN")}`,
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
          <div className="mt-5">
            <ChartCard
              eyebrow="Trend"
              title="Income & Expense Trend"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[...monthlyFinancialData].reverse()}
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
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `Rs. ${Number(value).toLocaleString("en-IN")}`,
                    ]}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">
            <p>Budget Buddy</p>
            <p>
              System-wide information is restricted to admins.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;






























