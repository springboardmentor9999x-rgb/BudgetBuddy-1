import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiUser,
  FiBell,
  FiShield,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* ==============================
          HEADER
      ============================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-5">

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="text-xl font-bold text-[#071a2b]">
              Settings
            </h1>

            <p className="text-xs text-slate-500">
              Manage your Budget Buddy preferences
            </p>
          </div>

        </div>

      </header>


      {/* ==============================
          CONTENT
      ============================== */}

      <main className="mx-auto max-w-5xl px-5 py-8">

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-lg font-bold text-[#071a2b]">
            Account Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account and application preferences.
          </p>


          <div className="mt-7 space-y-3">

            {/* ==============================
                PROFILE
            ============================== */}

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiUser />
              </div>

              <div className="flex-1">

                <p className="font-bold text-slate-700">
                  Profile
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  View your personal account information
                </p>

              </div>

              <FiChevronRight className="text-slate-300 transition group-hover:text-emerald-500" />

            </button>


            {/* ==============================
                NOTIFICATIONS
            ============================== */}

            <button
              type="button"
              onClick={() => {
                // Notification functionality can be added here later
              }}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiBell />
              </div>

              <div className="flex-1">

                <p className="font-bold text-slate-700">
                  Notifications
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Manage Budget Buddy notifications
                </p>

              </div>

              <span className="text-xs font-semibold text-emerald-600">
                Enabled
              </span>

            </button>


            {/* ==============================
                SECURITY
            ============================== */}

            <button
              type="button"
              onClick={() => navigate("/security")}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-purple-200 hover:bg-purple-50"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FiShield />
              </div>

              <div className="flex-1">

                <p className="font-bold text-slate-700">
                  Security
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Manage your account security
                </p>

              </div>

              <FiChevronRight className="text-slate-300 transition group-hover:text-purple-500" />

            </button>


            {/* ==============================
                LOGOUT
            ============================== */}

            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 text-left transition hover:bg-red-100"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-red-500">
                <FiLogOut />
              </div>

              <div className="flex-1">

                <p className="font-bold text-red-600">
                  Logout
                </p>

                <p className="mt-1 text-xs text-red-400">
                  Sign out of your Budget Buddy account
                </p>

              </div>

              <FiChevronRight className="text-red-300" />

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Settings;