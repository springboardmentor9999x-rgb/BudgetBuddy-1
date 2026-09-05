import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiShield,
  FiEye,
  FiEyeOff,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../services/api";

function Security() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/auth/change-password",
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        "Unable to change password. Please try again.";

      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-5">

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to settings"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="text-xl font-bold text-[#071a2b]">
              Security
            </h1>

            <p className="text-xs text-slate-500">
              Manage your account security
            </p>
          </div>

        </div>

      </header>

      {/* ================= CONTENT ================= */}

      <main className="mx-auto max-w-5xl px-5 py-8">

        <div className="mx-auto max-w-2xl">

          {/* ================= SECURITY CARD ================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            {/* TITLE */}

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FiShield className="text-xl" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#071a2b]">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Keep your Budget Buddy account secure.
                </p>
              </div>

            </div>

            {/* ================= MESSAGES ================= */}

            {successMessage && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

                <FiCheckCircle className="mt-0.5 shrink-0" />

                <p>{successMessage}</p>

              </div>
            )}

            {errorMessage && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                <FiAlertCircle className="mt-0.5 shrink-0" />

                <p>{errorMessage}</p>

              </div>
            )}

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleChangePassword}
              className="mt-7 space-y-5"
            >

              {/* CURRENT PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>

                <div className="relative">

                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>

                </div>

              </div>

              {/* NEW PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <div className="relative">

                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 6 characters.
                </p>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>

                <div className="relative">

                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>

                </div>

              </div>

              {/* ================= ACTIONS ================= */}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Changing Password..."
                    : "Change Password"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

          {/* ================= SECURITY NOTE ================= */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex gap-3">

              <FiShield className="mt-0.5 shrink-0 text-purple-500" />

              <div>

                <p className="text-sm font-bold text-slate-700">
                  Security tip
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Never share your Budget Buddy password
                  with anyone. Use a strong password that
                  you do not reuse on other websites.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Security;