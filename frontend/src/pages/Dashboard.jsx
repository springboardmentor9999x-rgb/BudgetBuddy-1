import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiLogOut,
  FiUser,
  FiMail,
  FiShield,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();

  const { token, logout } = useAuth();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#071a2b]">
              Budget Buddy
            </h1>

            <p className="text-xs font-medium text-emerald-600">
              Personal Finance Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-semibold text-emerald-600">
            OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#071a2b]">
            {loadingUser
              ? "Loading your dashboard..."
              : `Welcome, ${user?.full_name || "Budget Buddy User"} 👋`}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Here's a quick overview of your finances.
          </p>
        </motion.div>

        {/* Finance Cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Income
                </p>

                <p className="mt-2 text-3xl font-bold text-[#071a2b]">
                  ₹0
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
                <FiTrendingUp />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-emerald-600">
              Your earnings will appear here
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Expenses
                </p>

                <p className="mt-2 text-3xl font-bold text-[#071a2b]">
                  ₹0
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
                <FiTrendingDown />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              Your spending will appear here
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Current Balance
                </p>

                <p className="mt-2 text-3xl font-bold text-[#071a2b]">
                  ₹0
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                <FiDollarSign />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              Income minus expenses
            </p>
          </motion.div>
        </div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1,
          }}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#071a2b]">
              Account Details
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your Budget Buddy profile information.
            </p>
          </div>

          {loadingUser ? (
            <div className="flex items-center gap-3 py-5">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

              <span className="text-sm text-slate-500">
                Loading account...
              </span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <FiUser />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {user?.full_name || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <FiMail />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {user?.email || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <FiShield />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Account Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    {user?.is_verified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default Dashboard;