import React, { useState, useEffect } from 'react';
import { Check, User, Mail, DollarSign, Briefcase, Shield, Save } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { CurrencyCode, UserProfile } from '../types/budget';
import { CURRENCIES } from '../data/categories';

export const UserView: React.FC = () => {
  const { user, updateProfile } = useBudget();

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserProfile['role']>(user.role);
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(String(user.monthlyIncomeGoal));
  const [currency, setCurrency] = useState<CurrencyCode>(user.currency);
  const [savingsTargetPercent, setSavingsTargetPercent] = useState(user.savingsTargetPercent || 20);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setMonthlyIncomeGoal(String(user.monthlyIncomeGoal));
    setCurrency(user.currency);
    setSavingsTargetPercent(user.savingsTargetPercent || 20);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim() || 'Ledger Owner',
      email: email.trim(),
      role,
      monthlyIncomeGoal: Math.max(0, parseFloat(monthlyIncomeGoal) || 0),
      currency,
      savingsTargetPercent,
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            User Profile
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 glass-input text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                Email Identifier
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 glass-input text-sm font-mono-code"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-4 py-3 glass-input text-sm cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-rose-400" />
                Archetype
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-3 glass-input text-sm cursor-pointer"
              >
                <option value="Professional">Professional</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Student">Student</option>
                <option value="Family">Family / Household</option>
              </select>
            </div>
            
            <div className="space-y-2 md:col-span-2 max-w-md">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Monthly Target Income Goal ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={monthlyIncomeGoal}
                onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
                className="w-full px-4 py-3 glass-input font-mono-code text-lg font-bold text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-4">
            {isSaved && (
              <span className="text-emerald-400 text-sm font-medium animate-in fade-in duration-300">
                Settings saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="btn-primary-gradient text-sm py-2.5 px-6 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
