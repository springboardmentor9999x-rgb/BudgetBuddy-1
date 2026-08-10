import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  FaHome,
  FaMoneyBillWave,
  FaPlusCircle,
  FaWallet,
  FaUser,
  FaBullseye,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChartPie
} from 'react-icons/fa';

import { useAuthStore } from './auth/store/useAuthStore.ts';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/income', label: 'Income', icon: <FaPlusCircle /> },
    { path: '/expenses', label: 'Expense', icon: <FaMoneyBillWave /> },
    { path: '/budget', label: 'Budget', icon: <FaWallet /> },
    { path: '/saving-goals', label: 'Saving Goals', icon: <FaBullseye /> },
    { path: '/account', label: 'Account', icon: <FaUser /> },
  ];

  return (
    <div className="flex h-screen bg-[#0b0d10] text-white jetbrains-mono-bold">
      {/* Sidebar for desktop and mobile overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-[#161c24] border-r border-white/5 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-60 md:shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
            <span className="text-2xl font-bold text-cyan-400 flex items-center">
              <span className='text-yellow-400'><FaChartPie /></span>
              <span className='ml-2'>Budget</span>
              <span className="text-orange-400">Buddy</span>
            </span>
            <button
              onClick={closeSidebar}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <FaTimes size={24} />
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
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-purple-600/20 text-purple-400 border-l-2 border-purple-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-cyan-200'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Logout button (red themed) */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with hamburger for mobile */}
        <header className="md:hidden flex items-center h-16 px-6 border-b border-white/5 bg-[#0b0d10] sticky top-0 z-40">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            <FaBars size={24} />
          </button>
          <span className="ml-4 text-lg font-semibold text-white">BudgetBuddy</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Navbar;