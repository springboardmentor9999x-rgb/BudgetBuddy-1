import { useState } from "react";
import { useNavigate } from "react-router";

import toast, { Toaster } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMoneyBillWave,
  FaGlobe,
} from "react-icons/fa";

import { api } from "../../api/api";
import bbImage from "../../assets/bb.png";
import { useAuthStore } from "../../store/AuthStore";

interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  monthly_income: number | string;
  currency: string;
}

const CURRENCIES = ["INR", "USD", "JPY"];

// Reusable Tailwind classes
const inputClass =
  "w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition bg-[rgba(15,20,26,0.7)] border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40";
const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

export default function RegisterFormBlock({
  setRegisterClicked,
}: {
  setRegisterClicked: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();

  const setEmail = useAuthStore((state) => state.setEmail);

  // ---------- State (all at top) ----------
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    email: "",
    password: "",
    full_name: "",
    monthly_income: "",
    currency: "INR", // fixed default
  });

  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

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

  // ---------- Handlers ----------
  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    // Clear mismatch error when passwords become equal
    if (registerError === "Passwords do not match" && registerData.password === e.target.value) {
      setRegisterError("");
    }
  };

  const handleRegisterSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client‑side validation
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

    try {
      setLoading(true);
      const response = await api.post("/auth/signup", registerData);
      console.log("Registration response:", response.data);
      setEmail(registerData.email);

      toast.success("OTP sent to your email. Please verify.");
      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);
    } catch (error: any) {
      if (error?.status === 400) {
        toast.error("Email already exists.");
      } else {
        toast.error(`Failed: ${error?.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
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

  // ---------- Render ----------
  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 md:p-6 bg-[radial-gradient(circle_at_20%_30%,#1a1e26,#0b0d10_80%)]">
        <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-black/40 bg-[rgba(22,28,36,0.85)] backdrop-blur-[6px] border border-white/5">
          {/* Form side */}
          <div className="w-full md:w-7/12 lg:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Create account
              </h1>
              <p className="text-gray-400 text-sm mt-1.5">
                Sign up to start tracking your money
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
                {/* Optional live hint */}
                {confirmPassword.length > 0 && (
                  <p
                    className={`text-xs mt-1 ${registerData.password === confirmPassword
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
                disabled={loading}
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg shadow-purple-600/20 transition-all bg-linear-to-r from-purple-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-purple-500/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              {/* Toggle to sign in */}
              <p className="text-center text-sm text-gray-400 pt-2">
                Already have an account?
                <button
                  disabled={loading}
                  type="button"
                  onClick={() => setRegisterClicked(false)}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors ml-1"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>

          {/* Image side */}
          <div className="hidden md:block md:w-5/12 lg:w-5/12 relative overflow-hidden group">
            <img
              src={bbImage}
              alt="abstract dark landscape"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}