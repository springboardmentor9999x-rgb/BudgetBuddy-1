import { useEffect, useState } from "react";
import api from "../services/api";

function AccountSettings() {
  const [profile, setProfile] = useState({
    full_name: "",
    monthly_income: "",
    currency: "INR",
  });

  const [email, setEmail] = useState("");

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ============================================================
  // LOAD PROFILE + ACCOUNT INFORMATION
  // ============================================================

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    setLoading(true);
    setProfileError("");

    try {
      const [profileResponse, userResponse] = await Promise.all([
        api.get("/profile/me"),
        api.get("/auth/me"),
      ]);

      const profileData = profileResponse.data;
      const userData = userResponse.data;

      setProfile({
        full_name: profileData.full_name || "",
        monthly_income:
          profileData.monthly_income !== null &&
          profileData.monthly_income !== undefined
            ? profileData.monthly_income
            : "",
        currency: profileData.currency || "INR",
      });

      setEmail(userData.email || "");
    } catch (error) {
      console.error("Failed to load account data:", error);

      setProfileError(
        getErrorMessage(
          error,
          "Unable to load your account information."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ERROR HANDLER
  // ============================================================

  const getErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || "Invalid input")
        .join(", ");
    }

    return fallback;
  };

  // ============================================================
  // PROFILE INPUT HANDLER
  // ============================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    const fullName = profile.full_name.trim();

    if (!fullName) {
      setProfileError("Full name is required.");
      return;
    }

    if (fullName.length < 2) {
      setProfileError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (profile.monthly_income === "") {
      setProfileError("Monthly income is required.");
      return;
    }

    const monthlyIncome = Number(profile.monthly_income);

    if (Number.isNaN(monthlyIncome) || monthlyIncome < 0) {
      setProfileError(
        "Monthly income must be zero or greater."
      );
      return;
    }

    if (!profile.currency.trim()) {
      setProfileError("Currency is required.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await api.put("/profile/me", {
        full_name: fullName,
        monthly_income: monthlyIncome,
        currency: profile.currency.trim().toUpperCase(),
      });

      const updatedProfile = response.data;

      setProfile({
        full_name: updatedProfile.full_name,
        monthly_income: updatedProfile.monthly_income,
        currency: updatedProfile.currency,
      });

      setProfileMessage(
        "Profile information updated successfully."
      );
    } catch (error) {
      console.error("Profile update failed:", error);

      setProfileError(
        getErrorMessage(
          error,
          "Unable to update your profile."
        )
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================================
  // PASSWORD INPUT HANDLER
  // ============================================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const currentPassword =
      passwordData.current_password;

    const newPassword =
      passwordData.new_password;

    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "New password is required."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordData({
        current_password: "",
        new_password: "",
      });

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error("Password change failed:", error);

      setPasswordError(
        getErrorMessage(
          error,
          "Unable to change your password."
        )
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading account settings...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Account Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your profile information and account security.
          </p>
        </div>

        {/* ====================================================
            PROFILE SETTINGS
        ==================================================== */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Profile Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal and financial profile information.
            </p>
          </div>

          {profileMessage && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={profile.full_name}
                  onChange={handleProfileChange}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter your full name"
                />
              </div>

              {/* EMAIL - READ ONLY */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Email cannot be changed.
                </p>
              </div>

              {/* MONTHLY INCOME */}
              <div>
                <label
                  htmlFor="monthly_income"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Monthly Income
                </label>

                <input
                  id="monthly_income"
                  name="monthly_income"
                  type="number"
                  min="0"
                  step="0.01"
                  value={profile.monthly_income}
                  onChange={handleProfileChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter monthly income"
                />
              </div>

              {/* CURRENCY */}
              <div>
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Currency
                </label>

                <select
                  id="currency"
                  name="currency"
                  value={profile.currency}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="INR">
                    INR - Indian Rupee
                  </option>

                  <option value="USD">
                    USD - US Dollar
                  </option>

                  <option value="EUR">
                    EUR - Euro
                  </option>

                  <option value="GBP">
                    GBP - British Pound
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ====================================================
            SECURITY SETTINGS
        ==================================================== */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Change your account password.
            </p>
          </div>

          {passwordMessage && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* CURRENT PASSWORD */}
              <div>
                <label
                  htmlFor="current_password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Current Password
                </label>

                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter current password"
                />
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label
                  htmlFor="new_password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  New Password
                </label>

                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter new password"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Minimum 8 characters.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;