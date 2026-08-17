import { useRef, useEffect } from 'react';
import {
  RiNotification3Line,
  RiCheckDoubleLine,
  RiDeleteBin6Line,
  RiCloseLine,
} from 'react-icons/ri';
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaBell,
  FaInfoCircle,
  FaFire,
} from 'react-icons/fa';
import { useNotificationStore } from './useNotificationStore';
import type { AppNotification, NotificationType } from './useNotificationStore';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  overspend:     <FaExclamationTriangle className="text-red-400 text-lg" />,
  goal_complete: <FaCheckCircle className="text-emerald-400 text-lg" />,
  goal_near:     <FaFire className="text-amber-400 text-lg" />,
  info:          <FaInfoCircle className="text-sky-400 text-lg" />,
};

const bgMap: Record<NotificationType, string> = {
  overspend:     'bg-red-500/10 border-red-500/20',
  goal_complete: 'bg-emerald-500/10 border-emerald-500/20',
  goal_near:     'bg-amber-500/10 border-amber-500/20',
  info:          'bg-sky-500/10 border-sky-500/20',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NotificationItem = ({
  n,
  onDismiss,
  onRead,
}: {
  n: AppNotification;
  onDismiss: () => void;
  onRead: () => void;
}) => (
  <div
    onClick={onRead}
    className={`relative flex gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${bgMap[n.type]} ${!n.read ? 'ring-1 ring-white/10' : 'opacity-70'}`}
  >
    {!n.read && (
      <span className="absolute top-3 right-8 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
    )}
    <div className="mt-0.5 shrink-0">{iconMap[n.type]}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
      <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.timestamp)}</p>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onDismiss(); }}
      className="shrink-0 self-start mt-0.5 text-gray-600 hover:text-gray-300 transition-colors"
    >
      <RiCloseLine size={15} />
    </button>
  </div>
);

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { notifications, markRead, markAllRead, clearAll, removeNotification, unreadCount } =
    useNotificationStore();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the panel
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay so the same click that opens the panel doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const count = unreadCount();

  return (
    // Fixed to the viewport — top-14 aligns directly below the 56px top header bar
    <div
      ref={panelRef}
      className="fixed top-14 right-3 w-80 sm:w-96 z-[200] bg-[#161c24] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-slideDown"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1a2128]">
        <div className="flex items-center gap-2">
          <RiNotification3Line className="text-purple-400" />
          <span className="text-sm font-bold text-white">Notifications</span>
          {count > 0 && (
            <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
              {count}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {count > 0 && (
            <button
              onClick={markAllRead}
              title="Mark all read"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <RiCheckDoubleLine size={16} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear all"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <RiDeleteBin6Line size={15} />
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <RiCloseLine size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto p-3 space-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <FaBell className="text-4xl text-gray-700" />
            <p className="text-gray-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              n={n}
              onRead={() => markRead(n.id)}
              onDismiss={() => removeNotification(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
