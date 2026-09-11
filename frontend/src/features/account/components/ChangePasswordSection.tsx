import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaKey,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaSpinner,
} from 'react-icons/fa';
import { RiMailSendLine } from 'react-icons/ri';
import { requestPasswordResetOtp, changePassword } from '../services/account.api';

interface ChangePasswordSectionProps {
  userEmail?: string;
}

const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({ userEmail }) => {
  const [mode, setMode] = useState<'otp' | 'direct'>('otp');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Form states
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Password strength validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: '', color: 'bg-transparent' };
    if (strengthScore <= 2) return { label: 'Weak', color: 'bg-rose-500' };
    if (strengthScore <= 4) return { label: 'Moderate', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await requestPasswordResetOtp();
      setOtpSent(true);
      setCountdown(60);
      toast.success(`Verification OTP sent to ${userEmail || 'your email'}!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || 'Failed to send OTP email. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'otp' && (!otp || otp.trim().length !== 6)) {
      toast.error('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    if (mode === 'direct' && !currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        current_password: mode === 'direct' ? currentPassword : undefined,
        otp: mode === 'otp' ? otp.trim() : undefined,
        new_password: newPassword,
      });

      toast.success('Password changed successfully! 🔐');
      // Reset form
      setOtp('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      setCountdown(0);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || 'Failed to change password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { label: strengthLabel, color: strengthColor } = getStrengthLabel();

  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-lg border border-white/5 p-5 md:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/20">
            <FaShieldAlt className="text-xl text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-200">Security & Password</h2>
            <p className="text-xs text-gray-400">
              Reset or update your account password securely
            </p>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="flex bg-[#161c24] p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              mode === 'otp'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Email OTP
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              mode === 'direct'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Current Password
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'otp' ? (
          /* Email OTP Flow */
          <div className="bg-[#161c24] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white flex items-center gap-2">
                  <FaEnvelope className="text-purple-400" />
                  Send Verification Code to Email
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  We'll send a 6-digit OTP to <span className="text-purple-300 font-medium">{userEmail || 'your email'}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || countdown > 0}
                className="shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                {isSendingOtp ? (
                  <><FaSpinner className="animate-spin" /> Sending...</>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <><RiMailSendLine size={14} /> {otpSent ? 'Resend OTP' : 'Send OTP'}</>
                )}
              </button>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full sm:w-48 text-center tracking-widest font-mono text-base px-3 py-2 bg-[#1e252e] border border-white/10 rounded-lg text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                required={mode === 'otp'}
              />
            </div>
          </div>
        ) : (
          /* Direct Password Flow */
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition pr-10"
                required={mode === 'direct'}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showCurrent ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 bg-[#161c24] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full px-3 py-2.5 bg-[#161c24] border rounded-xl text-sm text-white outline-none focus:ring-1 transition pr-10 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-white/10 focus:border-purple-500 focus:ring-purple-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Password strength indicator */}
        {newPassword.length > 0 && (
          <div className="bg-[#161c24] p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400">Strength:</span>
              <span className="font-semibold text-white">{strengthLabel}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    strengthScore >= level ? strengthColor : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 mt-2">
              <span className={hasMinLength ? 'text-emerald-400' : ''}>✓ 8+ chars</span>
              <span className={hasUpper ? 'text-emerald-400' : ''}>✓ Uppercase</span>
              <span className={hasLower ? 'text-emerald-400' : ''}>✓ Lowercase</span>
              <span className={hasNumber ? 'text-emerald-400' : ''}>✓ Number</span>
              <span className={hasSpecial ? 'text-emerald-400' : ''}>✓ Symbol</span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
          >
            {isSubmitting ? (
              <><FaSpinner className="animate-spin" /> Updating Password...</>
            ) : (
              <><FaKey size={13} /> Update Password</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
