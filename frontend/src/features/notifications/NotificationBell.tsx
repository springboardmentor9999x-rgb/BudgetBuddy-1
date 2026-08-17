import { useRef, useState } from 'react';
import { RiNotification3Line } from 'react-icons/ri';
import { useNotificationStore } from './useNotificationStore';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const bellRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={bellRef}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label="Notifications"
      >
        <RiNotification3Line size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-purple-500 text-white rounded-full px-0.5 ring-2 ring-[#0d1117] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default NotificationBell;
