import React, { useState, useEffect } from 'react';
import {
  RiCloseLine,
  RiVipCrownLine,
  RiCheckLine,
  RiSendPlaneLine,
  RiFileChartLine,
  RiWalletLine,
  RiTargetLine,
  RiLineChartLine,
  RiTimeLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuthStore } from '../features/auth/store/useAuthStore.ts';
import {
  fetchMySubscriptionStatusApi,
  requestSubscriptionApi,
} from '../features/subscriptions/services/subscription.api.ts';
import type { SubscriptionStatusResponse } from '../features/subscriptions/types/subscription.type.ts';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title = 'Unlock Premium Superpowers',
  reason = 'You have reached the basic tier limit for this feature.',
}) => {
  const user = useAuthStore((s) => s.user);

  const [subStatus, setSubStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await fetchMySubscriptionStatusApi();
      setSubStatus(data);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await requestSubscriptionApi(userNote);
      setSubStatus(res);
      setUserNote('');
      toast.success('🚀 Subscription request submitted! The administrator has been notified.');
    } catch (err: any) {
      console.error('Failed to submit subscription request:', err);
      toast.error(err?.response?.data?.detail || 'Failed to submit subscription request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyPremium = user?.role === 'premium' || user?.role === 'admin';
  const hasPendingRequest = subStatus?.has_pending;
  const latestRequest = subStatus?.latest_request;

  const premiumPerks = [
    {
      icon: <RiWalletLine className="text-emerald-400" />,
      title: 'Unlimited Budgets (5 max on Basic)',
      desc: 'Track unlimited spending categories with automatic category overspend alerts.',
    },
    {
      icon: <RiTargetLine className="text-purple-400" />,
      title: 'Unlimited Savings Goals (2 max on Basic)',
      desc: 'Set as many milestone targets and waterfall liquidity allocations as you need.',
    },
    {
      icon: <RiFileChartLine className="text-cyan-400" />,
      title: 'Full Financial Summary Reports (PDF & Excel)',
      desc: 'Download 4-sheet formatted workbooks and comprehensive audit-ready PDF ledgers with executive KPI summaries.',
    },
    {
      icon: <RiLineChartLine className="text-amber-400" />,
      title: 'Advanced Predictive Analytics',
      desc: 'Unlock month-end spend projections, burn rates, and financial health scoring.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1a212d] to-[#12171f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <RiCloseLine size={20} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 shrink-0">
            <div className="w-full h-full bg-[#161c24] rounded-2xl flex items-center justify-center text-amber-400 text-2xl">
              <RiVipCrownLine />
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Premium Subscription
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">{title}</h2>
          </div>
        </div>

        {/* Reason Alert */}
        {reason && !isAlreadyPremium && (
          <p className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
            ⚡ {reason}
          </p>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Perks Grid */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Exclusive Premium Benefits:
            </p>
            {premiumPerks.map((perk, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all"
              >
                <div className="p-2 rounded-xl bg-white/5 shrink-0 text-lg">{perk.icon}</div>
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {perk.title}
                    <RiCheckLine className="text-emerald-400 text-base shrink-0" />
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Status Banners ── */}
          {isAlreadyPremium ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <span className="text-xl shrink-0">👑</span>
              <div>
                <p className="font-bold text-sm text-white">Active Premium Member</p>
                <p className="mt-0.5">You currently have full unlimited access across all BudgetBuddy features!</p>
              </div>
            </div>
          ) : hasPendingRequest ? (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <RiTimeLine className="text-amber-400 text-lg animate-pulse" />
                Subscription Request Pending Admin Review
              </div>
              <p className="text-gray-300 text-xs">
                Your request was submitted on{' '}
                <strong className="text-amber-300">
                  {latestRequest?.created_at ? new Date(latestRequest.created_at).toLocaleDateString() : 'recently'}
                </strong>{' '}
                and is awaiting administrator approval. You will be notified in real time once reviewed.
              </p>
              {latestRequest?.user_note && (
                <p className="text-[11px] text-gray-400 bg-black/30 p-2 rounded-lg border border-white/5 italic">
                  "{latestRequest.user_note}"
                </p>
              )}
            </div>
          ) : latestRequest?.status === 'rejected' ? (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <RiErrorWarningLine className="text-base" /> Previous Request Not Approved
              </div>
              <p className="text-gray-300">
                Admin response: {latestRequest.admin_response || 'Request was rejected by administrator.'}
              </p>
              <p className="text-gray-400 text-[11px]">You may submit a new request below.</p>
            </div>
          ) : null}

          {/* Subscription Request Form (for basic user with no pending request) */}
          {!isAlreadyPremium && !hasPendingRequest && (
            <form onSubmit={handleRequestSubscription} className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Optional Note for Administrator:
                </label>
                <textarea
                  rows={2}
                  maxLength={400}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="e.g., I would like to manage unlimited category budgets and milestone savings."
                  className="w-full bg-[#0f141a] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingStatus}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RiSendPlaneLine className="text-base" />
                {isSubmitting ? 'Submitting Request...' : 'Request Premium Subscription'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/5 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
