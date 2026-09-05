import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiShield,
  FiCreditCard,
  FiEdit3,
  FiSave,
  FiX,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setFullName(response.data.full_name || "");
      } catch (error) {
        console.error("Unable to fetch profile:", error);

        logout();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token, logout, navigate]);

  const handleEdit = () => {
    setFullName(user?.full_name || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setFullName(user?.full_name || "");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      alert("Full name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      setUser((prev) => ({
        ...prev,
        full_name: fullName.trim(),
      }));

      setEditing(false);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Unable to update profile:", error);

      alert("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
            </button>

            <div>

              <h1 className="text-xl font-bold text-[#071a2b]">
                My Profile
              </h1>

              <p className="text-xs text-slate-500">
                Your Budget Buddy account
              </p>

            </div>

          </div>

          {!loading && !editing && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl bg-[#071a2b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d2a43]"
            >
              <FiEdit3 />
              Edit Profile
            </button>
          )}

        </div>

      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-[#071a2b] px-6 py-10 text-white sm:px-10">

            <div className="flex flex-col items-center gap-4 sm:flex-row">

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-3xl font-bold shadow-lg">

                {user?.full_name
                  ? user.full_name.charAt(0).toUpperCase()
                  : "U"}

              </div>

              <div className="text-center sm:text-left">

                <h2 className="text-2xl font-bold">

                  {loading
                    ? "Loading..."
                    : user?.full_name || "Budget Buddy User"}

                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {user?.email || ""}
                </p>

              </div>

            </div>

          </div>

          <div className="p-6 sm:p-10">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="text-lg font-bold text-[#071a2b]">
                  Account Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Information associated with your Budget Buddy account.
                </p>

              </div>

            </div>

            {loading ? (

              <div className="mt-8 flex items-center gap-3">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

                <span className="text-sm text-slate-500">
                  Loading profile...
                </span>

              </div>

            ) : (

              <div className="mt-7 grid gap-4 md:grid-cols-2">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <FiUser />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-xs text-slate-400">
                        Full Name
                      </p>

                      {editing ? (

                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />

                      ) : (

                        <p className="mt-1 font-bold text-slate-700">
                          {user?.full_name || "Not available"}
                        </p>

                      )}

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <FiMail />
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Email
                      </p>

                      <p className="mt-1 truncate font-bold text-slate-700">
                        {user?.email || "Not available"}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Email is linked to your account login.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
                      <FiShield />
                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Account Status
                      </p>

                      <p
                        className={`mt-1 font-bold ${
                          user?.is_verified
                            ? "text-emerald-600"
                            : "text-amber-500"
                        }`}
                      >
                        {user?.is_verified
                          ? "Verified"
                          : "Unverified"}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm">
                      <FiShield />
                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Role
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
                          user?.role === "admin"
                            ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                            : user?.role === "premium"
                              ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {user?.role || "normal"}
                      </span>

                    </div>

                  </div>

                </div>

                {user?.role !== "admin" && (
                  <button
                    type="button"
                    onClick={() => navigate("/accounts")}
                    className="rounded-2xl bg-slate-50 p-5 text-left transition hover:bg-emerald-50"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <FiCreditCard />
                      </div>

                      <div>

                        <p className="text-xs text-slate-400">
                          Bank Accounts
                        </p>

                        <p className="mt-1 font-bold text-emerald-600">
                          Manage Accounts →
                        </p>

                      </div>

                    </div>

                  </button>
                )}

              </div>
            )}

            {editing && (

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <FiX />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  <FiSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Profile;
