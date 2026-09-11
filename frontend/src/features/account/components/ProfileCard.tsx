import { FaRegEdit, FaUser, FaEnvelope, FaShieldAlt, FaWallet } from 'react-icons/fa';
import type { User } from '../types/account.type.ts';

type ProfileCardProps = {
  user: User;
  setEditMode: (editMode: boolean) => void;
};

const ProfileCard = ({ user, setEditMode }: ProfileCardProps) => {
  const fullName = user?.profile?.full_name || 'BudgetBuddy User';
  const email = user?.email || '—';
  const role = user?.role || 'User';
  const currency = user?.profile?.currency || '₹';
  const monthlyIncome = Number(user?.profile?.monthly_income || 0);

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-xl border border-white/5 p-6 mb-6 relative overflow-hidden transition-all duration-300 hover:border-purple-500/20 group">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Avatar Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          {/* Avatar with Gradient */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-purple-900/30 border border-white/10 shrink-0">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">{fullName}</h2>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {role}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <FaEnvelope className="text-gray-500 text-[10px]" />
              {email}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setEditMode(true)}
          className="self-end sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all duration-200 shadow-sm"
        >
          <FaRegEdit size={14} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {/* Full Name */}
        <div className="bg-[#161c24] p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <FaUser className="text-purple-400" />
            <span>Full Name</span>
          </div>
          <p className="text-sm font-bold text-white truncate">{fullName}</p>
        </div>

        {/* Email */}
        <div className="bg-[#161c24] p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <FaEnvelope className="text-blue-400" />
            <span>Email Address</span>
          </div>
          <p className="text-sm font-bold text-white truncate" title={email}>{email}</p>
        </div>

        {/* Account Role */}
        <div className="bg-[#161c24] p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <FaShieldAlt className="text-emerald-400" />
            <span>Account Role</span>
          </div>
          <p className="text-sm font-bold text-white capitalize">{role}</p>
        </div>

        {/* Monthly Income */}
        <div className="bg-[#161c24] p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <FaWallet className="text-amber-400" />
            <span>Monthly Income</span>
          </div>
          <p className="text-sm font-bold text-emerald-400">
            {currency === 'INR' ? '₹' : currency} {monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;