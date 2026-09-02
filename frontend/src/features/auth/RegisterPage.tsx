import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMoneyBillWave,
  FaGlobe,
  FaCheckCircle,
  FaArrowLeft,
  FaRedo,
} from "react-icons/fa";
import bbImage from "../../assets/bb.png";

import { registerApi, verifyOtpApi, resendOtpApi } from "./services/auth.api.ts";
import type { registerUser } from "./types/auth.type.ts";
import { setPageTitle } from "../../utils/setTitle.ts";

const CURRENCIES = ["INR", "USD", "JPY"];

// Reusable Tailwind classes
const inputClass =
  "w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition bg-[rgba(15,20,26,0.7)] border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40";
const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

export default function RegisterPage() {
  setPageTitle("Register | BudgetBuddy");
  const navigate = useNavigate();

  // ---------- Page Step State (Single Page flow) ----------
  const [step, setStep] = useState<"register" | "verify">("register");

  // ---------- Local Registration State (No context/store dependency) ----------
  const [registerData, setRegisterData] = useState<registerUser>({
    email: "",
    password: "",
    full_name: "",
    monthly_income: 0,
    currency: "INR",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // ---------- Local OTP State ----------
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer effect for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ---------- Helpers ----------
  const isPasswordStrong = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecial
    );
  };

  // ---------- Registration Form Handlers ----------
  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (
      registerError === "Passwords do not match" &&
      registerData.password === e.target.value
    ) {
      setRegisterError("");
    }
  };

  const handleRegisterSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (registerData.password !== confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    if (!isPasswordStrong(registerData.password)) {
      setRegisterError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setRegisterError("");
    setIsRegistering(true);

    try {
      await registerApi(registerData);
      toast.success("Verification code sent to your email!");
      setStep("verify");
      setResendCooldown(60); // 60s cooldown for resend
      setOtp("");
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.message;
      if (error?.status === 400 || error?.response?.status === 400) {
        toast.error(detail || "Email already exists.");
      } else {
        toast.error(`Registration failed: ${detail || "Unknown error"}`);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // ---------- OTP Verification Handlers ----------
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtpApi(registerData.email, otp);
      toast.success("🎉 Account verified successfully! You can now sign in.");
      navigate("/login");
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail || "Invalid or expired OTP. Please try again.";
      toast.error(detail);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await resendOtpApi(registerData.email);
      toast.success("A new verification code has been sent!");
      setResendCooldown(60);
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail || "Failed to resend verification code.";
      toast.error(detail);
    } finally {
      setIsResending(false);
    }
  };

  // ---------- Computed styles for confirm password ----------
  const getConfirmPasswordInputClass = () => {
    if (confirmPassword.length === 0) return `${inputClass} pl-10 pr-10`;
    if (registerData.password === confirmPassword) {
      return `${inputClass} pl-10 pr-10 border-green-500 focus:border-green-500 focus:ring-green-500/40`;
    }
    return `${inputClass} pl-10 pr-10 border-red-500 focus:border-red-500 focus:ring-red-500/40`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 md:p-6 bg-[radial-gradient(circle_at_20%_30%,#1a1e26,#0b0d10_80%)]">
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-black/40 bg-[rgba(22,28,36,0.85)] backdrop-blur-[6px] border border-white/5">
        
        {/* ── Form Side ── */}
        <div className="w-full md:w-7/12 lg:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          
          {/* Step Indicator Header */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${
                step === "register"
                  ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }`}
            >
              {step === "register" ? "Step 1 of 2: Details" : "Step 2 of 2: Verification"}
            </span>
          </div>

          {/* ══════════════ STEP 1: REGISTRATION FORM ══════════════ */}
          {step === "register" ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Create account
                </h1>
                <p className="text-gray-400 text-sm mt-1.5">
                  Sign up to start tracking and budgeting your money
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full name */}
                <div>
                  <label htmlFor="full_name" className={labelClass}>
                    Full name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      required
                      placeholder="your name"
                      value={registerData.full_name}
                      onChange={handleRegisterChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className={labelClass}>
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <FaLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="reg-password"
                      name="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      className={`${inputClass} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className={labelClass}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <FaLock />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      className={getConfirmPasswordInputClass()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        registerData.password === confirmPassword
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {registerData.password === confirmPassword
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Monthly income & Currency */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="monthly_income" className={labelClass}>
                      Monthly income
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                        <FaMoneyBillWave />
                      </span>
                      <input
                        type="number"
                        id="monthly_income"
                        name="monthly_income"
                        required
                        min="0"
                        placeholder="50000"
                        value={registerData.monthly_income}
                        onChange={handleRegisterChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="w-28">
                    <label htmlFor="currency" className={labelClass}>
                      Currency
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                        <FaGlobe />
                      </span>
                      <select
                        id="currency"
                        name="currency"
                        value={registerData.currency}
                        onChange={handleRegisterChange}
                        className={`${inputClass} pl-10 appearance-none cursor-pointer`}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c} className="bg-[#161c24]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {registerError && (
                  <p className="text-sm text-red-400 -mt-1">{registerError}</p>
                )}

                {/* Submit button */}
                <button
                  disabled={isRegistering}
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg shadow-purple-600/20 transition-all bg-linear-to-r from-purple-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-purple-500/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isRegistering ? "Creating Account..." : "Create Account & Verify"}
                </button>

                {/* Link to sign in */}
                <p className="text-center text-sm text-gray-400 pt-2">
                  Already have an account?
                  <Link
                    to="/login"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors ml-1"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          ) : (
            /* ══════════════ STEP 2: OTP VERIFICATION (SAME PAGE) ══════════════ */
            <div>
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight flex items-center gap-2">
                  Verify your email <FaCheckCircle className="text-emerald-400 text-2xl" />
                </h1>
                <p className="text-gray-400 text-sm mt-1.5">
                  Enter the 6-digit verification code sent to:
                </p>

                {/* Email Chip with Edit button */}
                <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 text-sm">
                      <FaEnvelope />
                    </span>
                    <span className="font-semibold text-white text-xs truncate">
                      {registerData.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline cursor-pointer ml-2"
                  >
                    Edit Email
                  </button>
                </div>
              </div>

              <form onSubmit={handleOtpVerifySubmit} className="space-y-5">
                <div>
                  <label htmlFor="otp-input" className={labelClass}>
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,26,0.7)] px-4 py-3.5 text-center text-3xl font-mono tracking-[0.4em] text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 placeholder:text-gray-600"
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={otp.length !== 6 || isVerifying}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg shadow-purple-600/20 transition-all bg-linear-to-r from-purple-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-purple-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerifying ? "Activating Account..." : "Verify & Activate Account"}
                </button>

                {/* Resend OTP & Back */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaArrowLeft /> Back to details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-medium transition-colors disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaRedo className={isResending ? "animate-spin" : ""} />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : isResending
                      ? "Sending..."
                      : "Resend Code"}
                  </button>
                </div>

                {/* Link to sign in */}
                <p className="text-center text-xs text-gray-500 pt-4 border-t border-white/5">
                  Already verified?{" "}
                  <Link
                    to="/login"
                    className="text-purple-400 hover:text-purple-300 font-medium ml-1"
                  >
                    Go to Sign in
                  </Link>
                </p>
              </form>
            </div>
          )}
        </div>

        {/* ── Image Side ── */}
        <div className="hidden md:block md:w-5/12 lg:w-5/12 relative overflow-hidden group">
          <img
            src={bbImage}
            alt="BudgetBuddy theme"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}