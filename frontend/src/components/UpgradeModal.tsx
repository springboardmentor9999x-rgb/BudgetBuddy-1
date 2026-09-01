import React, { useState } from 'react';
import {
  RiCloseLine,
  RiVipCrownLine,
  RiCheckLine,
  RiFlashlightLine,
  RiFileChartLine,
  RiWalletLine,
  RiTargetLine,
  RiLineChartLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuthStore } from '../features/auth/store/useAuthStore.ts';

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
  const [isUpgrading, setIsUpgrading] = useState(false);
  const upgradeTier = useAuthStore((s) => s.upgradeTier);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeTier('premium');
      toast.success('🎉 Welcome to BudgetBuddy Premium! Unlimited features unlocked.');
      onClose();
    } catch (error) {
      console.error('Failed to upgrade tier:', error);
      toast.error('Failed to upgrade tier. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const premiumPerks = [
    {
      icon: <RiWalletLine className="text-emerald-400" />,
      title: 'Unlimited Budgets',
      desc: 'Track unlimited spending categories with proactive alerts.',
    },
    {
      icon: <RiTargetLine className="text-purple-400" />,
      title: 'Unlimited Savings Goals',
      desc: 'Set as many milestone targets and waterfall liquidity allocations as you need.',
    },
    {
      icon: <RiFileChartLine className="text-cyan-400" />,
      title: 'Full Multi-Sheet Excel & PDF Reports',
      desc: 'Download 4-sheet formatted workbooks and comprehensive audit-ready PDF ledgers.',
    },
    {
      icon: <RiLineChartLine className="text-amber-400" />,
      title: 'Advanced Predictive Analytics',
      desc: 'Unlock month-end spend projections, burn rates, and financial health scoring.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1a212d] to-[#12171f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <RiCloseLine size={20} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30">
            <div className="w-full h-full bg-[#161c24] rounded-2xl flex items-center justify-center text-amber-400 text-2xl">
              <RiVipCrownLine />
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Premium Upgrade
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">{title}</h2>
          </div>
        </div>

        {/* Reason Alert */}
        {reason && (
          <p className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-xl p-3 mb-5">
            ⚡ {reason}
          </p>
        )}

        {/* Perks Grid */}
        <div className="space-y-3 mb-6">
          {premiumPerks.map((perk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="p-2 rounded-xl bg-white/5 shrink-0 text-lg">{perk.icon}</div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  {perk.title}
                  <RiCheckLine className="text-emerald-400 text-base" />
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RiFlashlightLine className="text-lg" />
            {isUpgrading ? 'Upgrading Tier...' : 'Upgrade to Premium Now'}
          </button>
          <button
            onClick={onClose}
            disabled={isUpgrading}
            className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/5 transition-all cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
