import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiCheckCircle,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import PasswordStrength from "../components/auth/PasswordStrength";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const passwordMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await api.post("/auth/signup", payload);

      console.log("Signup response:", response.data);

      /*
       * Account has been created and the backend has already
       * sent the verification OTP.
       *
       * Pass the email to the verification page using
       * React Router state.
       */
      navigate("/verify-email", {
        state: {
          email: payload.email,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response) {
        const detail = error.response.data?.detail;

        if (Array.isArray(detail)) {
          const messages = detail
            .map((item) =>
              item.msg?.replace("Value error, ", "")
            )
            .join("\n");

          setErrorMessage(messages);
        } else {
          setErrorMessage(
            detail ||
              "Something went wrong. Please try again."
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
              Get started
            </p>
          </div>

          <h2 className="text-[32px] font-bold tracking-[-0.035em] text-[#071a2b] sm:text-[38px]">
            Create your account
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Start managing your money smarter. It only takes a minute.
          </p>
        </motion.div>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 whitespace-pre-line rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />

            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >
          <AuthInput
            label="Full Name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            icon={FiUser}
            required
            autoComplete="name"
          />

          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            icon={FiMail}
            required
            autoComplete="email"
          />

          <div>
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            <PasswordStrength password={formData.password} />
          </div>

          <div>
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            {passwordMismatch && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500"
              >
                <FiAlertCircle />
                Passwords do not match
              </motion.p>
            )}

            {passwordsMatch && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600"
              >
                <FiCheckCircle />
                Passwords match
              </motion.p>
            )}
          </div>

          {/* Create Account Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="
              group
              mt-2
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

                Creating your account...
              </>
            ) : (
              <>
                Create account

                <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>

          {/* Login Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-slate-100" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Already a member?
            </span>

            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Login Link */}
          <Link
            to="/login"
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
            Sign in to Budget Buddy
          </Link>
        </form>

        {/* Security */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✓
          </span>

          Your information is securely protected.
        </div>

        {/* Terms */}
        <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
          By creating an account, you agree to our{" "}
          <button
            type="button"
            className="font-medium text-slate-500 hover:text-emerald-600"
          >
            Terms
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="font-medium text-slate-500 hover:text-emerald-600"
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;