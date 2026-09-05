import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FiHome,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPlus,
  FiArrowUpRight,
  FiArrowDownRight,
  FiLogOut,
  FiUser,
  FiMail,
  FiShield,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronRight,
  FiTarget,
  FiBell,
  FiFileText,
  FiStar,
  FiUsers,
  FiDownload,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../services/api";

import {
  getExpenses,
  getExpenseSummary,
} from "../services/expenseService";

import {
  getIncomes,
  getIncomeSummary,
} from "../services/incomeService";

import { useAuth } from "../context/AuthContext";

import SavingsGoalForm from "../components/SavingsGoalForm";
import SavingsGoalList from "../components/SavingsGoalList";

function Dashboard() {
  const navigate = useNavigate();
  const { token, logout, isPremium, isAdmin } = useAuth();
  const hasPremiumAccess = isPremium || isAdmin;

  // ==========================================
  // SIDEBAR
  // ==========================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==========================================
  // SAVINGS GOALS
  // ==========================================

  const [savingsGoalRefreshKey, setSavingsGoalRefreshKey] = useState(0);

  const handleGoalCreated = () => {
    setSavingsGoalRefreshKey((current) => current + 1);
  };

  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ==========================================
  // EXPENSES
  // ==========================================

  const [expenseSummary, setExpenseSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // ==========================================
  // INCOME
  // ==========================================

  const [incomeSummary, setIncomeSummary] = useState(null);
  const [recentIncome, setRecentIncome] = useState([]);
  const [loadingIncome, setLoadingIncome] = useState(true);

  // ==========================================
  // ANALYTICS
  // ==========================================

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumRequestLoading, setPremiumRequestLoading] = useState(false);
  const [premiumRequestStatus, setPremiumRequestStatus] = useState("none");
  const [toast, setToast] = useState(null);

useEffect(() => {
  setPremiumRequestStatus(user?.premium_request_status || 'none');
}, [user?.premium_request_status]);

useEffect(() => {
  setPremiumRequestStatus(user?.premium_request_status || "none");
}, [user?.premium_request_status]);
  const handlePremiumRequest = async () => {
    if (premiumRequestStatus === "pending") return;

    try {
      setPremiumRequestLoading(true);

      const response = await api.post("/premium/request");

      setPremiumRequestStatus(response.data.status);
      setPremiumModalOpen(false);

      setToast({ type: "success", message: "Premium Access request sent to the administrator." });
    } catch (error) {
      setToast({ type: "error", message: error.response?.data?.detail || "Unable to submit Premium request." });
    } finally {
      setPremiumRequestLoading(false);
    }
  };

  // ==========================================
  // FETCH USER
  // ==========================================

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Unable to fetch user:", error);

        logout();

        navigate("/login", {
          replace: true,
        });
      } finally {
        setLoadingUser(false);
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token, logout, navigate]);

  // ==========================================
  // FETCH EXPENSES
  // ==========================================

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const [summary, expenses] = await Promise.all([
          getExpenseSummary(),
          getExpenses(),
        ]);

        setExpenseSummary(summary);

        const safeExpenses = Array.isArray(expenses)
          ? expenses
          : [];

        const sortedExpenses = [...safeExpenses].sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        setRecentExpenses(sortedExpenses.slice(0, 5));
      } catch (error) {
        console.error(
          "Unable to fetch expense data:",
          error
        );
      } finally {
        setLoadingExpenses(false);
      }
    };

    if (token) {
      fetchExpenseData();
    }
  }, [token]);

  // ==========================================
  // FETCH INCOME
  // ==========================================

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const [summary, incomes] = await Promise.all([
          getIncomeSummary(),
          getIncomes(),
        ]);

        setIncomeSummary(summary);

        const safeIncomes = Array.isArray(incomes)
          ? incomes
          : [];

        const sortedIncomes = [...safeIncomes].sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        setRecentIncome(sortedIncomes.slice(0, 5));
      } catch (error) {
        console.error(
          "Unable to fetch income:",
          error
        );
      } finally {
        setLoadingIncome(false);
      }
    };


    if (token) {
      fetchIncomeData();
    }
  }, [token]);

  // ==========================================
  // FETCH ANALYTICS
  // ==========================================

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(
          "/analytics/overview"
        );

        setAnalytics(response.data);

        console.log(
          "Analytics loaded:",
          response.data
        );
      } catch (error) {
        console.error(
          "Unable to fetch analytics:",
          error
        );
      } finally {
        setLoadingAnalytics(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

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

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // ==========================================
  // NOTIFICATION HELPERS
  // ==========================================

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

  // ==========================================
  // VALUES
  // ==========================================

  const totalIncome = Number(
    incomeSummary?.total_income || 0
  );

  const totalExpenses = Number(
    expenseSummary?.total_expense || 0
  );

  const availableBalance =
    totalIncome - totalExpenses;

  const netWorth =
    totalIncome - totalExpenses;

  // ==========================================
  // ANALYTICS VALUES
  // ==========================================

  const analyticsSummary = analytics?.summary || {
    total_income: 0,
    total_expenses: 0,
    net_savings: 0,
  };

  const monthlyAnalytics =
    Array.isArray(analytics?.monthly)
      ? analytics.monthly
      : [];
  const categoryAnalytics =
    Array.isArray(analytics?.categories)
      ? analytics.categories
      : [];

  // ==========================================
  // CHART COLORS
  // ==========================================

  const categoryColors = [
    "#ef4444",
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b",
  ];

  // ==========================================
  // CHART DATA
  // ==========================================

  const monthlyChartData = monthlyAnalytics.map(
    (month) => ({
      name: `${month.month}/${String(
        month.year
      ).slice(-2)}`,
      income: Number(month.income || 0),
      expenses: Number(month.expenses || 0),
      savings: Number(month.net_savings || 0),
    })
  );

  const categoryChartData = categoryAnalytics
    .map((category) => ({
      name: category.category || "Other",
      value: Number(category.total_amount || 0),
    }))
    .filter((category) => category.value > 0);

  const incomeExpenseChartData = [
    {
      name: "Income",
      value: Number(
        analyticsSummary.total_income || 0
      ),
    },
    {
      name: "Expenses",
      value: Number(
        analyticsSummary.total_expenses || 0
      ),
    },
  ].filter((item) => item.value > 0);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatCurrency = (value) => {
    return `\u20B9${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatChartCurrency = (value) => {
    return `\u20B9${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // ==========================================
  // CUSTOM TOOLTIP
  // ==========================================

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        {label && (
          <p className="mb-2 text-xs font-bold text-slate-500">
            {label}
          </p>
        )}

        {payload.map((item, index) => (
          <div
            key={`${item.dataKey}-${index}`}
            className="flex items-center justify-between gap-5 text-sm"
          >
            <span className="font-medium text-slate-600">
              {item.name}
            </span>

            <span
              className="font-bold"
              style={{
                color:
                  item.color ||
                  "#071a2b",
              }}
            >
              {formatChartCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // ==========================================
  // PIE TOOLTIP
  // ==========================================

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const item = payload[0];

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-sm font-bold text-slate-700">
          {item.name}
        </p>

        <p
          className="mt-1 text-sm font-bold"
          style={{
            color:
              item.payload?.fill ||
              "#10b981",
          }}
        >
          {formatChartCurrency(item.value)}
        </p>
      </div>
    );
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigation = (path) => {
    setMobileMenuOpen(false);

    if (path === "#analytics") {
      setTimeout(() => {
        const sections = document.querySelectorAll("section");

        for (const section of sections) {
          if (section.innerText.includes("Financial Analytics")) {
            window.scrollTo({
              top:
                section.getBoundingClientRect().top +
                window.scrollY -
                20,
              behavior: "smooth",
            });
            break;
          }
        }
      }, 100);

      return;
    }

    if (path === "/dashboard#savings-goals") {
      navigate("/dashboard");

      setTimeout(() => {
        const element =
          document.getElementById("savings-goals");

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      return;
    }

    navigate(path);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // NAV ITEMS
  // ==========================================

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      name: "Bank Accounts",
      path: "/accounts",
      icon: FiCreditCard,
    },
    {
      name: "Analytics",
      path: "#analytics",
      icon: FiTrendingUp,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FiFileText,
    },
    {
      name: "Income",
      path: "/income",
      icon: FiTrendingUp,
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: FiTrendingDown,
    },
    {
      name: "Budgets",
      path: "/budgets",
      icon: FiTarget,
    },
    {
      name: "Savings Goals",
      path: "/savings-goals",
      icon: FiTarget,
    },
    ...(isAdmin ? [
      {
        name: "User Management",
        path: "/admin/users",
        icon: FiUsers,
      },
      {
        name: "Admin Reports",
        path: "/admin/reports",
        icon: FiDownload,
      },
    ] : []),
  ];

  // ==========================================
  // SIDEBAR
  // ==========================================

  const SidebarContent = () => (
    <div className="flex h-full flex-col">

      {/* LOGO */}

      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-bold text-white shadow-lg shadow-emerald-900/20">
            B
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Budget Buddy
            </h1>

            <p className="text-xs text-slate-400">
              Your money, simplified
            </p>
          </div>

        </div>
      </div>

      {/* PREMIUM / UPGRADE */}

      {hasPremiumAccess ? (
        <div className="px-4 pt-2">
          <div className="relative flex items-center gap-3 rounded-2xl border border-amber-400/70 bg-slate-900 px-3 py-2 shadow-lg shadow-amber-500/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-lg text-amber-400">
              <FiStar />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-300">{isAdmin ? "Admin" : "Premium User"}</p>
              <p className="text-[10px] font-medium text-slate-500">{isAdmin ? "Admin access enabled" : "Premium access enabled"}</p>
            </div>
            <FiStar className="text-lg text-amber-400" />
          </div>
        </div>
      ) : (
        <div className="px-4 pt-2">
          <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-br from-slate-900 to-slate-800 p-3 shadow-lg shadow-amber-500/10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-xl text-amber-400">
                <FiStar />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-300">Upgrade to Premium</p>
                <p className="mt-0.5 text-[10px] leading-3.5 text-slate-400">Unlock advanced analytics and premium reports.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPremiumModalOpen(true)}
              disabled={premiumRequestStatus === "pending"}
              className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {premiumRequestStatus === "pending" ? "Request Pending" : "Upgrade Now"}
            </button>
          </div>
        </div>
      )}
      <nav className="min-h-0 flex-1 px-4 py-2">

        <div className="space-y-0.5">

          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.name === "Dashboard";

            return (
              <button
                key={item.name}
                type="button"
                onClick={() =>
                  handleNavigation(item.path)
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-1 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >

                <Icon className="text-lg" />

                <span className="flex-1">
                  {item.name}
                </span>

                {active && <FiChevronRight />}

              </button>
            );
          })}

        </div>

        {/* ACCOUNT SECTION */}

        <p className="mb-0.5 mt-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Account
        </p>

        <div className="space-y-0.5">

          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              handleNavigation("/profile")
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >

            <FiUser className="text-lg" />

            <span className="flex-1">
              Profile
            </span>

            <FiChevronRight />

          </button>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() =>
              handleNavigation("/settings")
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >

            <FiSettings className="text-lg" />

            <span className="flex-1">
              Settings
            </span>

            <FiChevronRight />

          </button>

        </div>

      </nav>

      {/* USER */}

      <div className="shrink-0 border-t border-white/10 p-2">

        <div className="mb-1 rounded-2xl bg-white/5 p-2.5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <FiUser />
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-white">
                {loadingUser
                  ? "Loading..."
                  : user?.full_name ||
                    "Budget Buddy User"}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {user?.email || ""}
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >

          <FiLogOut />

          Logout

        </button>

      </div>

    </div>
  );

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {toast && (
        <div className="fixed right-6 top-6 z-[100]">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
              toast.type === "success"
                ? "border-emerald-400/30 bg-emerald-500 text-white"
                : "border-red-400/30 bg-red-500 text-white"
            }`}
          >
            <span className="text-sm font-semibold">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-lg font-bold leading-none opacity-80 hover:opacity-100"
              aria-label="Close notification"
            >
                  X
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#071a2b] lg:block">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-slate-900/50"
          />

          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="absolute inset-y-0 left-0 w-72 bg-[#071a2b]"
          >

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
            >
              <FiX />
            </button>

            <SidebarContent />

          </motion.aside>

        </div>
      )}

      {/* MAIN AREA */}

      <div className="lg:pl-64">

        {/* MOBILE HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">

          <div className="flex items-center justify-between px-5 py-4">

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
            >
              <FiMenu />
            </button>

            <div className="text-center">

              <p className="font-bold text-[#071a2b]">
                Budget Buddy
              </p>

              <p className="text-[10px] font-semibold text-emerald-600">
                FINANCE DASHBOARD
              </p>

            </div>

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
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>

          </div>

        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">

          {/* WELCOME */}

          <motion.section
            id="analytics"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"
          >

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Financial Overview
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#071a2b] sm:text-4xl">
                {loadingUser
                  ? "Loading your dashboard..."
                  : `Welcome back, ${
                      user?.full_name ||
                      "Budget Buddy User"
                    }`}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Track your income, spending and
                bank accounts from one place.
              </p>

            </div>

            <div className="flex items-center gap-3">
              {hasPremiumAccess && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {isAdmin ? "Admin" : "Premium"}
                </span>
              )}

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
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-14 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#071a2b]">
                        Notifications
                      </p>
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
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  navigate("/accounts")
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
              >
                <FiCreditCard />
                Bank Accounts
              </button>


            </div>
            </div>

</motion.section>

          {/* AVAILABLE BALANCE */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className="relative mt-8 overflow-hidden rounded-3xl bg-[#071a2b] p-7 text-white shadow-xl shadow-slate-200 sm:p-8"
          >

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10" />

            <div className="absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-blue-400/5" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                    <FiDollarSign />
                  </div>

                  <p className="text-sm font-medium text-slate-300">
                    Available Balance
                  </p>

                </div>

                <p className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                  {loadingIncome ||
                  loadingExpenses
                    ? "..."
                    : formatCurrency(
                        availableBalance
                      )}
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Recorded income minus recorded expenses
                </p>

              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">

                <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">

                  <p className="text-xs text-slate-400">
                    Income
                  </p>

                  <p className="mt-1 font-bold text-emerald-300">
                    {loadingIncome
                      ? "..."
                      : formatCurrency(
                          totalIncome
                        )}
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">

                  <p className="text-xs text-slate-400">
                    Expenses
                  </p>

                  <p className="mt-1 font-bold text-red-300">
                    {loadingExpenses
                      ? "..."
                      : formatCurrency(
                          totalExpenses
                        )}
                  </p>

                </div>

              </div>

            </div>

          </motion.section>

          {/* FINANCE CARDS */}

          <section className="mt-7 grid gap-4 md:grid-cols-3">

            {/* INCOME */}

            <motion.button
              type="button"
              whileHover={{ y: -3 }}
              onClick={() =>
                navigate("/income")
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Income
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#071a2b]">
                    {loadingIncome
                      ? "..."
                      : formatCurrency(
                          totalIncome
                        )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiArrowUpRight />
                </div>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <span className="text-xs text-slate-400">
                  Recorded earnings
                </span>

                <span className="text-xs font-bold text-emerald-600">
                  View ?
                </span>

              </div>

            </motion.button>

            {/* EXPENSE */}

            <motion.button
              type="button"
              whileHover={{ y: -3 }}
              onClick={() =>
                navigate("/expenses")
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-red-200"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Expenses
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#071a2b]">
                    {loadingExpenses
                      ? "..."
                      : formatCurrency(
                          totalExpenses
                        )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <FiArrowDownRight />
                </div>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <span className="text-xs text-slate-400">
                  Recorded spending
                </span>

                <span className="text-xs font-bold text-red-500">
                  View ?
                </span>

              </div>

            </motion.button>

            {/* NET WORTH */}

            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Net Worth
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#071a2b]">
                    {loadingIncome ||
                    loadingExpenses
                      ? "..."
                      : formatCurrency(
                          netWorth
                        )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiDollarSign />
                </div>

              </div>

              <p className="mt-5 text-xs text-slate-400">
                Income -&gt; expenses
              </p>

            </motion.div>

          </section>

          {/* ==========================================
              ANALYTICS OVERVIEW
          ========================================== */}

          <motion.section
            id="analytics"
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
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            {/* ANALYTICS HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Analytics
                </p>

                <h3 className="mt-1 text-xl font-bold text-[#071a2b]">
                  Financial Analytics
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Visualize your income, expenses and spending patterns.
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                {loadingAnalytics
                  ? "Loading..."
                  : "Connected"}
              </div>

            </div>

            {/* ANALYTICS LOADING */}

            {loadingAnalytics ? (

              <div className="flex items-center gap-3 py-10">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                <span className="text-sm text-slate-500">
                  Loading analytics...
                </span>

              </div>

            ) : analytics ? (

              <div className="mt-6">

                {/* ======================================
                    SUMMARY CARDS
                ====================================== */}

                <div className="grid gap-4 md:grid-cols-3">

                  {/* INCOME */}

                  <div className="rounded-2xl bg-emerald-50 p-5">

                    <p className="text-sm font-medium text-slate-500">
                      Analytics Income
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                      {formatCurrency(
                        analyticsSummary.total_income
                      )}
                    </p>

                  </div>

                  {/* EXPENSES */}

                  <div className="rounded-2xl bg-red-50 p-5">

                    <p className="text-sm font-medium text-slate-500">
                      Analytics Expenses
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-600">
                      {formatCurrency(
                        analyticsSummary.total_expenses
                      )}
                    </p>

                  </div>

                  {/* SAVINGS */}

                  {hasPremiumAccess && (
                    <div className="rounded-2xl bg-blue-50 p-5">

                    <p className="text-sm font-medium text-slate-500">
                      Net Savings
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-700">
                      {formatCurrency(
                        analyticsSummary.net_savings
                      )}
                    </p>

                    </div>
                  )}

                </div>

                {/* ======================================
                    CHARTS
                ====================================== */}

                {hasPremiumAccess && (
                  <div className="mt-5 grid gap-5 lg:grid-cols-2">

                  {/* ====================================
                      MONTHLY INCOME & EXPENSES
                  ==================================== */}

                  <div className="rounded-2xl border border-slate-200 p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <h4 className="font-bold text-[#071a2b]">
                          Monthly Income & Expenses
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                          Compare your monthly financial activity.
                        </p>

                      </div>

                      <FiTrendingUp className="text-emerald-600" />

                    </div>

                    {monthlyChartData.length === 0 ? (

                      <div className="flex h-80 items-center justify-center">

                        <p className="text-sm text-slate-400">
                          No monthly data available.
                        </p>

                      </div>

                    ) : (

                      <div className="mt-5 h-80 w-full">

                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >

                          <BarChart
                            data={monthlyChartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 0,
                              bottom: 10,
                            }}
                            barCategoryGap="25%"
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#e2e8f0"
                            />

                            <XAxis
                              dataKey="name"
                              tick={{
                                fill: "#64748b",
                                fontSize: 12,
                              }}
                              axisLine={false}
                              tickLine={false}
                            />

                            <YAxis
                              tick={{
                                fill: "#64748b",
                                fontSize: 11,
                              }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) =>
                                `\u20B9${Number(
                                  value
                                ).toLocaleString(
                                  "en-IN"
                                )}`
                              }
                            />

                            <Tooltip
                              content={<ChartTooltip />}
                              cursor={{
                                fill: "#f8fafc",
                              }}
                            />

                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="square"
                            />

                            <Bar
                              dataKey="expenses"
                              name="Expenses"
                              fill="#ef4444"
                              radius={[
                                6,
                                6,
                                0,
                                0,
                              ]}
                              maxBarSize={42}
                            />

                            <Bar
                              dataKey="income"
                              name="Income"
                              fill="#10b981"
                              radius={[
                                6,
                                6,
                                0,
                                0,
                              ]}
                              maxBarSize={42}
                            />

                          </BarChart>

                        </ResponsiveContainer>

                      </div>

                    )}

                  </div>

                  {/* ====================================
                      EXPENSE CATEGORIES
                  ==================================== */}

                  <div className="rounded-2xl border border-slate-200 p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <h4 className="font-bold text-[#071a2b]">
                          Expense Categories
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                          See where your money is being spent.
                        </p>

                      </div>

                      <FiTrendingDown className="text-red-500" />

                    </div>

                    {categoryChartData.length === 0 ? (

                      <div className="flex h-80 items-center justify-center">

                        <div className="text-center">

                          <p className="text-sm font-semibold text-slate-500">
                            No category data available.
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Add expenses to see your spending breakdown.
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="mt-5 h-80 w-full">

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
                              cy="45%"
                              innerRadius={65}
                              outerRadius={105}
                              paddingAngle={2}
                              stroke="#ffffff"
                              strokeWidth={2}
                              labelLine={false}
                              label={({ name, percent }) =>
                                percent >= 0.05
                                  ? `${name} ${(
                                      percent * 100
                                    ).toFixed(0)}%`
                                  : ""
                              }
                            >

                              {categoryChartData.map(
                                (entry, index) => (
                                  <Cell
                                    key={`category-cell-${index}`}
                                    fill={
                                      categoryColors[
                                        index %
                                          categoryColors.length
                                      ]
                                    }
                                  />
                                )
                              )}

                            </Pie>

                            <Tooltip
                              content={<PieTooltip />}
                            />

                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="circle"
                            />

                          </PieChart>

                        </ResponsiveContainer>

                      </div>

                    )}

                  </div>

                </div>
                )}

                {/* ======================================
                    INCOME VS EXPENSES DONUT
                ====================================== */}

                <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <h4 className="font-bold text-[#071a2b]">
                        Income vs Expenses
                      </h4>

                      <p className="mt-1 text-xs text-slate-400">
                        Overall comparison of your income and spending.
                      </p>

                    </div>

                    <FiDollarSign className="text-blue-600" />

                  </div>

                  {incomeExpenseChartData.length === 0 ? (

                    <div className="flex h-80 items-center justify-center">

                      <p className="text-sm text-slate-400">
                        No income or expense data available.
                      </p>

                    </div>

                  ) : (

                    <div className="mt-5 grid items-center gap-6 md:grid-cols-2">

                      {/* DONUT */}

                      <div className="h-80 w-full">

                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >

                          <PieChart>

                            <Pie
                              data={incomeExpenseChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={115}
                              paddingAngle={3}
                              stroke="#ffffff"
                              strokeWidth={3}
                            >

                              <Cell
                                fill="#10b981"
                              />

                              <Cell
                                fill="#ef4444"
                              />

                            </Pie>

                            <Tooltip
                              content={<PieTooltip />}
                            />

                          </PieChart>

                        </ResponsiveContainer>

                      </div>

                      {/* BREAKDOWN */}

                      <div className="space-y-4">

                        {incomeExpenseChartData.map(
                          (item, index) => {

                            const total =
                              incomeExpenseChartData.reduce(
                                (sum, current) =>
                                  sum +
                                  Number(
                                    current.value ||
                                      0
                                  ),
                                0
                              );

                            const percentage =
                              total > 0
                                ? (
                                    (Number(
                                      item.value
                                    ) /
                                      total) *
                                    100
                                  ).toFixed(1)
                                : 0;

                            const isIncome =
                              item.name ===
                              "Income";

                            return (
                              <div
                                key={item.name}
                                className="rounded-2xl bg-slate-50 p-5"
                              >

                                <div className="flex items-center justify-between">

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`h-3 w-3 rounded-full ${
                                        isIncome
                                          ? "bg-emerald-500"
                                          : "bg-red-500"
                                      }`}
                                    />

                                    <span className="text-sm font-bold text-slate-700">
                                      {item.name}
                                    </span>

                                  </div>

                                  <span
                                    className={`text-xs font-bold ${
                                      isIncome
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {percentage}%
                                  </span>

                                </div>

                                <p
                                  className={`mt-2 text-2xl font-bold ${
                                    isIncome
                                      ? "text-emerald-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {formatCurrency(
                                    item.value
                                  )}
                                </p>

                              </div>
                            );
                          }
                        )}

                        {/* NET SAVINGS */}

                        <div className="rounded-2xl bg-blue-50 p-5">

                          <p className="text-xs font-semibold text-slate-500">
                            Net Savings
                          </p>

                          <p className="mt-1 text-2xl font-bold text-blue-700">
                            {formatCurrency(
                              analyticsSummary.net_savings
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            ) : (

              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">

                <p className="text-sm font-semibold text-slate-600">
                  Analytics data could not be loaded.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Check the backend server and authentication.
                </p>

              </div>

            )}

          </motion.section>

          {/* QUICK ACTIONS */}

          <section className="mt-8">

            <div className="mb-4">

              <h3 className="text-lg font-bold text-[#071a2b]">
                Quick Actions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Quickly manage your finances.
              </p>

            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/income")
                }
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiTrendingUp />
                </div>

                <div className="flex-1">

                  <p className="text-sm font-bold text-slate-700">
                    Add Income
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Record earnings
                  </p>

                </div>

                <FiChevronRight className="text-slate-300 transition group-hover:translate-x-1" />

              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/expenses")
                }
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:shadow-md"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FiTrendingDown />
                </div>

                <div className="flex-1">

                  <p className="text-sm font-bold text-slate-700">
                    Add Expense
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Record spending
                  </p>

                </div>

                <FiChevronRight className="text-slate-300 transition group-hover:translate-x-1" />

              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/accounts")
                }
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiCreditCard />
                </div>

                <div className="flex-1">

                  <p className="text-sm font-bold text-slate-700">
                    Add Account
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Manage banks
                  </p>

                </div>

                <FiChevronRight className="text-slate-300 transition group-hover:translate-x-1" />

              </button>

            </div>

          </section>

          {/* LOWER GRID */}

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

            {/* RECENT EXPENSES */}

            <motion.section
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

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-[#071a2b]">
                    Recent Expenses
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest transactions.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/expenses")
                  }
                  className="text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
                >
                  View All
                </button>

              </div>

              {loadingExpenses ? (

                <div className="flex items-center gap-3 py-10">

                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                  <span className="text-sm text-slate-500">
                    Loading expenses...
                  </span>

                </div>

              ) : recentExpenses.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                  <p className="text-sm font-semibold text-slate-600">
                    No expenses recorded yet
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/expenses")
                    }
                    className="mt-3 text-sm font-bold text-emerald-600"
                  >
                    Add your first expense
                  </button>

                </div>

              ) : (

                <div className="mt-5 divide-y divide-slate-100">

                  {recentExpenses.map(
                    (expense) => (

                      <div
                        key={expense.id}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiArrowDownRight />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-700">
                              {expense.category}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {expense.description ||
                                expense.payment_method ||
                                "No description"}
                            </p>

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-sm font-bold text-red-500">
                            -
                            {formatCurrency(
                              expense.amount
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(
                              expense.date
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </motion.section>

            {/* RECENT INCOME */}

            <motion.section
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

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-[#071a2b]">
                    Recent Income
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest income entries.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/income")
                  }
                  className="text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
                >
                  View All
                </button>

              </div>

              {loadingIncome ? (

                <div className="flex items-center gap-3 py-10">

                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                  <span className="text-sm text-slate-500">
                    Loading income...
                  </span>

                </div>

              ) : recentIncome.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                  <p className="text-sm font-semibold text-slate-600">
                    No income recorded yet
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/income")
                    }
                    className="mt-3 text-sm font-bold text-emerald-600"
                  >
                    Add your first income
                  </button>

                </div>

              ) : (

                <div className="mt-5 divide-y divide-slate-100">

                  {recentIncome.map(
                    (income) => (

                      <div
                        key={income.id}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                            <FiArrowUpRight />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-700">
                              {income.source || income.category || "Income"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {income.description ||
                                income.payment_method ||
                                "No description"}
                            </p>

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-sm font-bold text-emerald-500">
                            +
                            {formatCurrency(
                              income.amount
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(
                              income.date
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </motion.section>


          </div>


          {/* PREMIUM MODAL */}

          {premiumModalOpen && !hasPremiumAccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl border border-amber-400/40 bg-slate-900 p-6 shadow-2xl shadow-black/40">

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-2xl text-amber-400">
                      <FiStar />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Premium Features
                      </h2>
                      <p className="text-xs text-slate-400">
                        Unlock the full power of Budget Buddy
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPremiumModalOpen(false)}
                    className="text-xl text-slate-400 transition hover:text-white"
                  >
                    X
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Advanced Analytics",
                    "PDF Report Generator",
                    "Excel Report Generator",
                    "Monthly & Category Analytics",
                    "Net Savings Insights",
                    "Free Premium Trial",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3"
                    >
                      <span className="text-amber-400">[OK]</span>
                      <span className="text-sm font-medium text-slate-200">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePremiumRequest}
                  disabled={premiumRequestLoading || premiumRequestStatus === "pending"}
                  className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {premiumRequestLoading
                    ? "Sending Request..."
                    : premiumRequestStatus === "pending"
                      ? "Request Pending"
                      : "Request Premium Access"}
                </button>

                <button
                  type="button"
                  onClick={() => setPremiumModalOpen(false)}
                  className="mt-3 w-full rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 transition hover:text-white"
                >
                  Maybe Later
                </button>

              </div>
            </div>
          )}
          {/* FOOTER */}

          <footer className="mt-10 border-t border-slate-200 py-6">

            <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <p>
                Budget Buddy - Personal Finance Management
              </p>

              <p>
                Keep track. Spend smarter.
              </p>

            </div>

          </footer>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;














































