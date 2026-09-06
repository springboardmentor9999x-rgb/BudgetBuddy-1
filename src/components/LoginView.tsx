import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { DEMO_USERS } from '../data/mockData';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, switchDemoAccount } = useBudget();
  const [email, setEmail] = useState('sarah.jenkins@budgetvault.io');
  const [password, setPassword] = useState('demo1234');
  const [activePersona, setActivePersona] = useState<string>('user_1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, activePersona);
  };

  const handleSelectDemoUser = (userId: string) => {
    setActivePersona(userId);
    const demoUser = DEMO_USERS[userId];
    if (demoUser) {
      setEmail(demoUser.email);
    }
    switchDemoAccount(userId);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="ambient-glow-bg" />

      <div className="relative z-10 w-full max-w-md glass-card border border-slate-800/80 p-8 shadow-2xl rounded-3xl space-y-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">BudgetBuddy</h1>
          <p className="text-xs text-slate-400 font-mono-code uppercase tracking-wider">
            Modern FinTech &amp; Wealth Operating System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm font-mono-code"
                placeholder="sarah.jenkins@budgetvault.io"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Vault Access Key</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm font-mono-code"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary-gradient flex items-center justify-center gap-2 py-3 mt-4 text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono-code">
              1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Instant Access
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(DEMO_USERS).map((u) => {
              const isSelected = activePersona === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u.id)}
                  className={`p-3 text-left rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="font-semibold text-xs text-white truncate flex items-center justify-between">
                    <span className="truncate">{u.fullName}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize mt-0.5 font-mono-code">
                    {u.role} &bull; {u.currency}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};