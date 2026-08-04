import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/auth/AuthLayout";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setErrorMessage("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pastedValue.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const code = otp.join("");

    if (!email) {
      setErrorMessage(
        "Email address is missing. Please create your account again."
      );
      return;
    }

    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email,
        code,
      });

      setSuccessMessage(
        response.data.message || "Email verified successfully."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email,
            verified: true,
          },
        });
      }, 1200);
    } catch (error) {
      const detail = error.response?.data?.detail;

      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Unable to verify your email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || timer > 0 || resending) return;

    setErrorMessage("");
    setSuccessMessage("");
    setResending(true);

    try {
      const response = await api.post("/auth/resend-verification", {
        email,
      });

      setSuccessMessage(
        response.data.message || "A new verification code has been sent."
      );

      setOtp(["", "", "", "", "", ""]);
      setTimer(30);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      const detail = error.response?.data?.detail;

      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Unable to resend the verification code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
            <FiMail />
          </div>

          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Secure your account
            </p>
          </div>

          <h2 className="text-[32px] font-bold tracking-[-0.035em] text-[#071a2b] sm:text-[38px]">
            Check your inbox
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-slate-700">
              {email || "your email address"}
            </span>
            .
          </p>
        </motion.div>

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

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="mt-8">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Verification code
          </label>

          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
                className="
                  h-14
                  min-w-0
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-center
                  text-xl
                  font-bold
                  text-[#071a2b]
                  outline-none
                  transition
                  focus:border-emerald-400
                  focus:ring-4
                  focus:ring-emerald-50
                "
              />
            ))}
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="
              group
              mt-6
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
                Verifying...
              </>
            ) : (
              <>
                Verify email
                <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || resending || !email}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <FiRefreshCw className={resending ? "animate-spin" : ""} />

            {resending
              ? "Sending..."
              : timer > 0
              ? `Resend code in ${timer}s`
              : "Resend verification code"}
          </button>
        </div>

        <div className="mt-7 border-t border-slate-100 pt-5 text-center">
          <Link
            to="/signup"
            className="text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            Wrong email? Create account again
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default VerifyEmail;