import { FaRegEdit } from 'react-icons/fa';
import type { User } from '../types/account.type.ts';

type ProfileCardProps = {
  user: User;
  setEditMode: (editMode: boolean) => void;
};

const ProfileCard = ({ user, setEditMode }: ProfileCardProps) => {
  return (
    <div className="bg-[#1e252e] rounded-2xl shadow-lg border border-white/5 p-4 md:p-6 mb-6 relative">
      <span
        onClick={() => setEditMode(true)}
        className='absolute right-2 top-1 p-2 rounded-lg text-xl text-purple-500 hover:bg-white/10 cursor-pointer transition-all duration-200'
      >
        <FaRegEdit />
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Full Name</label>
          <p className="text-lg text-gray-200 font-medium">{user?.profile?.full_name || '—'}</p>
        </div>
        <div className='overflow-hidden'>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <p className="text-lg text-gray-200 font-medium">{user?.email || '—'}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Role</label>
          <p className="text-lg text-gray-200 font-medium capitalize">{user?.role || '—'}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Monthly Income</label>
          <p className="text-lg text-gray-200 font-medium">
            {user?.profile?.currency || 'INR'} {user?.profile?.monthly_income || '0.00'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard