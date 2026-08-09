import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router";
import { useShallow } from "zustand/shallow";

import { useAuthStore } from "./store/useAuthStore";


export default function OtpVerify() {

  const [otp, setOtp] = useState("");
  const { email, verifyOtp } = useAuthStore(useShallow((state) => ({
    email: state.email,
    verifyOtp: state.verifyOtp
  })));

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    console.log("OTP:", otp);
    try {
      await verifyOtp(email, otp);
      console.log("OTP verified successfully!");
      toast.success("OTP verified successfully! You can now log in.");
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      toast.error('OTP verification failed. Please try again.');
    }

  };

  const handleResend = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Resend OTP");

    // await api.post("/resend-otp");
  };

  return (
    <>
      {email === "" && <Navigate to="/dashboard" replace />}
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">
            Verify OTP
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter the 6-digit verification code sent to your email.
          </p>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            placeholder="123456"
            className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
          />

          <button
            onClick={handleSubmit}
            disabled={otp.length !== 6}
            className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Verify OTP
          </button>

          <button
            onClick={handleResend}
            className="mt-3 w-full text-sm text-slate-400 transition hover:text-cyan-400"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </>

  );
}