import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  RiDashboardLine,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
  RiWalletLine,
  RiTargetLine,
  RiUserLine,
  RiMenuLine,
  RiCloseLine,
  RiLogoutCircleLine,
  RiPieChartLine,
  RiFileChartLine,
  RiShieldUserLine,
  RiGroupLine,
  RiFileList3Line,
  RiVipCrownLine,
  RiSparklingLine,
} from 'react-icons/ri';

import { useAuthStore } from './auth/store/useAuthStore.ts';
import toast from 'react-hot-toast';
import NotificationBell from './notifications/NotificationBell.tsx';
import { useNotificationWebSocket } from './notifications/useNotificationWebSocket.ts';
import UpgradeModal from '../components/UpgradeModal.tsx';

const Navbar = () => {
  useNotificationWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => { navigate('/login'); }, 1500);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const navItems = [
    { path: '/dashboard',    label: 'Dashboard',    icon: <RiDashboardLine /> },
    { path: '/income',       label: 'Income',        icon: <RiArrowUpCircleLine /> },
    { path: '/expenses',     label: 'Expense',       icon: <RiArrowDownCircleLine /> },
    { path: '/budget',       label: 'Budget',        icon: <RiWalletLine /> },
    { path: '/saving-goals', label: 'Saving Goals',  icon: <RiTargetLine /> },
    { path: '/reports',      label: 'Reports',       icon: <RiFileChartLine /> },
    { path: '/account',      label: 'Account',       icon: <RiUserLine /> },
  ];

  const adminNavItems = [
    { path: '/admin/analytics', label: 'System Analytics', icon: <RiShieldUserLine /> },
    { path: '/admin/users',     label: 'User Management',  icon: <RiGroupLine /> },
    { path: '/admin/logs',      label: 'System Logs',      icon: <RiFileList3Line /> },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            <RiShieldUserLine /> ADMIN
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            <RiVipCrownLine /> PREMIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            BASIC USER
          </span>
        );
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#0b0d10] text-white jetbrains-mono-bold">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#161c24] border-r border-white/5
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:w-64 md:shrink-0
          `}
        >
          <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
              <span className="text-xl font-bold flex items-center">
                <span className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.3)]">
                  <RiPieChartLine />
                </span>
                <span className="ml-2 bg-linear-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                  BudgetBuddy
                </span>
              </span>
              <button
                onClick={closeSidebar}
                className="md:hidden text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <RiCloseLine size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <p className="px-3 text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">
                Main Menu
              </p>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                     transition-all duration-200 ease-in-out transform hover:scale-[1.01]
                     ${
                       isActive
                         ? 'bg-gradient-to-r from-purple-600/20 to-purple-500/10 text-purple-400 border-l-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]'
                         : 'text-gray-400 hover:bg-white/5 hover:text-cyan-200 hover:shadow-[inset_0_0_8px_rgba(0,255,255,0.05)]'
                     }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}

              {/* ── Admin Navigation Section (Visible ONLY for Admin Role) ── */}
              {user?.role === 'admin' && (
                <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                  <p className="px-3 text-[10px] uppercase font-extrabold text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <RiShieldUserLine /> Admin Portal
                  </p>
                  {adminNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                         transition-all duration-200 ease-in-out transform hover:scale-[1.01]
                         ${
                           isActive
                             ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-300 border-l-2 border-purple-400 font-bold shadow-[inset_0_0_12px_rgba(168,85,247,0.25)]'
                             : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-300'
                         }`
                      }
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Upgrade Banner for Basic User */}
              {user?.role === 'user' && (
                <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/20 text-center">
                  <span className="inline-flex p-2 rounded-xl bg-amber-500/20 text-amber-400 text-lg mb-1.5">
                    <RiSparklingLine />
                  </span>
                  <p className="text-xs font-bold text-white">Upgrade to Premium</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 mb-2.5">
                    Unlock unlimited budgets, goals, and multi-sheet exports.
                  </p>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    Upgrade Now ⭐
                  </button>
                </div>
              )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5 shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                           border border-red-500/30 text-red-400
                           hover:bg-red-500/10 hover:border-red-400 hover:text-red-300
                           transition-all duration-200 ease-in-out cursor-pointer"
              >
                <RiLogoutCircleLine className="text-xl" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Area ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top Header Bar – always visible on all screen sizes */}
          <header className="flex items-center h-16 px-4 md:px-6 border-b border-white/5 bg-[#0d1117] sticky top-0 z-40 backdrop-blur-sm shrink-0">
            {/* Hamburger – mobile only */}
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-400 hover:text-white transition-colors mr-3 cursor-pointer"
              aria-label="Open menu"
            >
              <RiMenuLine size={22} />
            </button>

            {/* Brand – mobile only (desktop has it in the sidebar) */}
            <span className="md:hidden text-base font-semibold bg-linear-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
              BudgetBuddy
            </span>

            {/* Push bell & role to the right */}
            <div className="flex-1" />

            <div className="flex items-center gap-3">
              {/* Header User Details & Plan Badge */}
              {user && (
                <div
                  onClick={() => navigate('/account')}
                  className="flex items-center gap-3 bg-[#161c24] hover:bg-[#1a212b] border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer group shadow-sm"
                  title="Account Settings"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform text-sm font-bold shrink-0">
                    {(user.profile?.full_name?.[0] || user.email[0] || 'U').toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors leading-tight truncate max-w-[140px] md:max-w-[200px]">
                      {user.profile?.full_name || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[140px] md:max-w-[200px]">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-2 border-l border-white/5 shrink-0">
                    {/* <span className="text-xs text-gray-400 hidden md:inline">Plan:</span> */}
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              )}

              {/* Notification Bell */}
              <NotificationBell />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default Navbar;