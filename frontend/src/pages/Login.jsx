import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import { useAuth } from "../context/AuthContext";



function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: location.state?.email || "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const verifiedMessage = location.state?.verified
    ? "Email verified successfully. You can now sign in."
    : "";
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.append("username", formData.username.trim());
      params.append("password", formData.password);

      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const accessToken = response.data.access_token;

      if (!accessToken) {
        throw new Error("Access token was not returned by the server.");
      }
         toast.success("Login successful!");
      // Store JWT through AuthContext
      const loggedInUser = await login(accessToken);

      // Successful login
      if (loggedInUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const detail = error.response.data?.detail;

        if (typeof detail === "string") {
          setErrorMessage(detail);
        } else {
          setErrorMessage(
            "Unable to sign in. Please check your credentials."
          );
        }
      } else {
        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });

      toast.success("Password reset code sent to your email.");
      setForgotStep(2);
    } catch (error) {
      console.error("Forgot password error:", error);

      const detail = error.response?.data?.detail;

      console.error("Forgot password response:", error.response?.data);
      console.error("Forgot password status:", error.response?.status);

      toast.error(
        typeof detail === "string"
          ? detail
          : error.message || "Unable to send password reset code."
      );
    } finally {
      setForgotLoading(false);
    }
  };
  const handleVerifyResetCode = async () => {
    if (!resetCode.trim()) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    if (resetCode.trim().length !== 6) {
      toast.error("Verification code must be 6 digits.");
      return;
    }

    setResetLoading(true);

    try {
      await api.post("/auth/verify-reset-code", {
        email: forgotEmail.trim(),
        code: resetCode.trim(),
      });

      toast.success("Code verified successfully.");
      setForgotStep(3);
    } catch (error) {
      console.error("Verify reset code error:", error);

      const detail = error.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : "Invalid or expired verification code."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setResetLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        new_password: newPassword,
      });

      toast.success("Password reset successfully.");

      setForgotPasswordOpen(false);
      setForgotStep(1);
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");

      setFormData((prev) => ({
        ...prev,
        username: forgotEmail.trim(),
        password: "",
      }));
    } catch (error) {
      console.error("Reset password error:", error);

      const detail = error.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : "Unable to reset your password."
      );
    } finally {
      setResetLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Welcome back
            </p>
          </div>

          <h2 className="text-[32px] font-bold tracking-[-0.035em] text-[#071a2b] sm:text-[38px]">
            Sign in to your account
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Continue managing your money with Budget Buddy.
          </p>
        </motion.div>

        {/* Email verification success */}
        {verifiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />

            <span>{verifiedMessage}</span>
          </motion.div>
        )}

        {/* Login error */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />

            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >

          <AuthInput
            label="Email Address"
            name="username"
            type="email"
            value={formData.username}
            onChange={handleChange}
            icon={FiMail}
            required
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(formData.username);
                setForgotPasswordOpen(true);
              }}
              className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="
              group
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#071a2b]
              px-5
              py-4
              text-sm
              font-bold
              text-white
              shadow-[0_12px_30px_rgba(7,26,43,0.18)]
              transition
              hover:bg-[#0b263b]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-emerald-400" />

                Signing in...
              </>
            ) : (
              <>
                Sign in

                <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-slate-100" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              New to Budget Buddy?
            </span>

            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Signup */}
          <Link
            to="/signup"
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-3.5
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:border-emerald-300
              hover:bg-emerald-50/50
              hover:text-emerald-700
            "
          >
            Create a Budget Buddy account
          </Link>
        </form>

        {/* Security */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            X
          </span>

          Secure authentication powered by Budget Buddy.
        </div>
      </div>
        {/* Forgot Password Modal */}
        {forgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a2b]/50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >

              {/* STEP 1 - EMAIL */}
              {forgotStep === 1 && (
                <>
                  <h3 className="text-xl font-bold text-[#071a2b]">
                    Forgot your password?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your email address and we'll send you a password reset code.
                  </p>

                  <div className="mt-5">
                    <AuthInput
                      label="Email Address"
                      name="forgotEmail"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      icon={FiMail}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(false)}
                      disabled={forgotLoading}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                      className="flex-1 rounded-xl bg-[#071a2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b263b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {forgotLoading ? "Sending..." : "Send Code"}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2 - VERIFICATION CODE */}
              {forgotStep === 2 && (
                <>
                  <h3 className="text-xl font-bold text-[#071a2b]">
                    Enter verification code
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-semibold text-slate-700">
                      {forgotEmail}
                    </span>
                  </p>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Verification Code
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      value={resetCode}
                      onChange={(e) =>
                        setResetCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="Enter 6-digit code"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-bold tracking-[0.35em] text-[#071a2b] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      disabled={resetLoading}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyResetCode}
                      disabled={resetLoading || resetCode.length !== 6}
                      className="flex-1 rounded-xl bg-[#071a2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b263b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resetLoading ? "Verifying..." : "Verify Code"}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3 - NEW PASSWORD */}
              {forgotStep === 3 && (
                <>
                  <h3 className="text-xl font-bold text-[#071a2b]">
                    Create new password
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your new password below.
                  </p>

                  <div className="mt-5 space-y-4">
                    <PasswordInput
                      label="New Password"
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />

                    <PasswordInput
                      label="Confirm Password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep(2)}
                      disabled={resetLoading}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={
                        resetLoading ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="flex-1 rounded-xl bg-[#071a2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b263b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}    </AuthLayout>
  );
}

export default Login;













