import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

      // Store JWT through AuthContext
      login(accessToken);

      // Successful login
      navigate("/dashboard", {
        replace: true,
      });
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
            ✓
          </span>

          Secure authentication powered by Budget Buddy.
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;