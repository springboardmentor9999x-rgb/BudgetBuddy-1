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
} from 'react-icons/ri';

import { useAuthStore } from './auth/store/useAuthStore.ts';
import toast from 'react-hot-toast';
import NotificationBell from './notifications/NotificationBell.tsx';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const logout = useAuthStore((state) => state.logout);

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
    { path: '/account',      label: 'Account',       icon: <RiUserLine /> },
  ];

  return (
    <div className="flex h-screen bg-[#0b0d10] text-white jetbrains-mono-bold">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-[#161c24] border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-60 md:shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/5 shrink-0">
            <span className="text-2xl font-bold flex items-center">
              <span className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.3)]">
                <RiPieChartLine />
              </span>
              <span className="ml-2 bg-linear-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                BudgetBuddy
              </span>
            </span>
            <button
              onClick={closeSidebar}
              className="md:hidden text-gray-400 hover:text-white transition-colors"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                   transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                   ${
                     isActive
                       ? 'bg-gradient-to-r from-purple-600/20 to-purple-500/10 text-purple-400 border-l-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]'
                       : 'text-gray-400 hover:bg-white/5 hover:text-cyan-200 hover:shadow-[inset_0_0_8px_rgba(0,255,255,0.05)]'
                   }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium
                         border border-red-500/30 text-red-400
                         hover:bg-red-500/10 hover:border-red-400 hover:text-red-300
                         transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
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
        <header className="flex items-center h-14 px-4 md:px-6 border-b border-white/5 bg-[#0d1117] sticky top-0 z-40 backdrop-blur-sm shrink-0">
          {/* Hamburger – mobile only */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-400 hover:text-white transition-colors mr-3"
            aria-label="Open menu"
          >
            <RiMenuLine size={22} />
          </button>

          {/* Brand – mobile only (desktop has it in the sidebar) */}
          <span className="md:hidden text-base font-semibold bg-linear-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
            BudgetBuddy
          </span>

          {/* Push bell to the right */}
          <div className="flex-1" />

          {/* Notification Bell – always top-right */}
          <NotificationBell />
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
  );
};

export default Navbar;