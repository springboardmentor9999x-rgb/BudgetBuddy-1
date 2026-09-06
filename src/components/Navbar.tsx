import React from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileSpreadsheet,
  Download,
  LayoutDashboard,
  Receipt,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Target,
  BarChart3,
  Sparkles,
  User,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export type ActiveTab =
  | 'dashboard'
  | 'expenses'
  | 'income'
  | 'transfers'
  | 'budgets'
  | 'goals'
  | 'user'
  | 'notifications';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenBudgetModal,
}) => {
  const { user, selectedMonth, setSelectedMonth, notifications, exportMasterFinancialReport, logout } = useBudget();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Navigation steps for month
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setSelectedMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  // Format month for display (e.g. August 2026)
  const [yearStr, monthStr] = selectedMonth.split('-');
  const displayDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
  const formattedMonthLabel = displayDate.toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'goals', label: 'Goals', icon: TrendingUp },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'user', label: 'Profile', icon: User },
  ] as const;

  // Get user initials for avatar
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'BV';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer group select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-lg text-white tracking-tight">
                    BudgetBuddy
                  </span>
                  <span className="text-[10px] font-mono-code font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Smart Financial Hub</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/80">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.id === 'notifications' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] leading-none ml-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Month Navigator Pill */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-1.5 py-1 text-xs font-medium text-slate-300 shadow-sm">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono-code font-semibold text-slate-200 min-w-[76px] text-center">
                {formattedMonthLabel}
              </span>
              <button
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Master Excel Report */}
            <button
              onClick={exportMasterFinancialReport}
              title="Download Master Excel Report (.xls)"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Report</span>
            </button>

            {/* Primary Add Transaction Button */}
            <button
              id="header-add-transaction-btn"
              onClick={onOpenAddModal}
              className="btn-primary-gradient cursor-pointer text-xs sm:text-sm py-2 px-3 sm:px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`relative p-2 rounded-xl border transition-colors cursor-pointer hidden sm:flex ${
                  activeTab === 'notifications'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#070b14] flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Avatar Pill */}
            <button
              onClick={() => setActiveTab('user')}
              title="User Settings & Currency"
              className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-indigo-600/20 border-indigo-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold shadow-inner">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight max-w-[90px] truncate">
                  {user.fullName.split(' ')[0]}
                </p>
                <p className="text-[10px] font-mono-code text-indigo-400 leading-none">
                  {user.currency}
                </p>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Sub-Navigation Scrollable Row */}
        <div className="flex xl:hidden items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar border-t border-slate-900 mt-2.5">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] leading-none ml-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
