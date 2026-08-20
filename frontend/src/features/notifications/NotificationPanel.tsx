import { useRef, useEffect, useState, useMemo } from 'react';
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
  overspend:     <FaExclamationTriangle className="text-rose-400 text-base" />,
  goal_complete: <FaCheckCircle className="text-emerald-400 text-base" />,
  goal_near:     <FaFire className="text-amber-400 text-base" />,
  info:          <FaInfoCircle className="text-sky-400 text-base" />,
};

const bgMap: Record<NotificationType, string> = {
  overspend:     'bg-rose-500/10 border-rose-500/25',
  goal_complete: 'bg-emerald-500/10 border-emerald-500/25',
  goal_near:     'bg-amber-500/10 border-amber-500/25',
  info:          'bg-sky-500/10 border-sky-500/25',
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
    className={`relative flex gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 hover:brightness-110 ${bgMap[n.type]} ${
      !n.read ? 'ring-1 ring-purple-500/30' : 'opacity-70'
    }`}
  >
    {!n.read && (
      <span className="absolute top-3.5 right-8 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
    )}
    <div className="mt-0.5 shrink-0">{iconMap[n.type]}</div>
    <div className="flex-1 min-w-0 pr-4">
      <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
      <p className="text-xs text-gray-300 mt-1 leading-relaxed">{n.message}</p>
      <p className="text-[10px] text-gray-500 mt-1.5">{timeAgo(n.timestamp)}</p>
    </div>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
      className="shrink-0 self-start mt-0.5 text-gray-500 hover:text-gray-300 transition-colors p-1"
      title="Dismiss"
    >
      <RiCloseLine size={16} />
    </button>
  </div>
);

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { notifications, markRead, markAllRead, clearAll, removeNotification, unreadCount } =
    useNotificationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'budget' | 'goals'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the panel
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, onClose]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return !n.read;
      if (activeTab === 'budget') return n.type === 'overspend';
      if (activeTab === 'goals') return n.type === 'goal_complete' || n.type === 'goal_near';
      return true;
    });
  }, [notifications, activeTab]);

  if (!isOpen) return null;

  const count = unreadCount();

  return (
    <div
      ref={panelRef}
      className="fixed top-14 right-3 w-80 sm:w-96 z-[200] bg-[#161c24] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1a2128]">
        <div className="flex items-center gap-2">
          <RiNotification3Line className="text-purple-400 text-lg" />
          <span className="text-sm font-bold text-white">Notifications</span>
          {count > 0 && (
            <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">
              {count} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <button
              onClick={markAllRead}
              title="Mark all as read"
              className="text-xs flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors px-2 py-1 rounded bg-white/5"
            >
              <RiCheckDoubleLine size={14} />
              <span>Mark read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear all notifications"
              className="text-gray-400 hover:text-rose-400 transition-colors p-1"
            >
              <RiDeleteBin6Line size={15} />
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <RiCloseLine size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-2 pb-1 gap-1 border-b border-white/5 bg-[#161c24]">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${count})` },
          { id: 'budget', label: 'Budget' },
          { id: 'goals', label: 'Goals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="max-h-[380px] overflow-y-auto p-3 space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <FaBell className="text-3xl text-gray-700" />
            <p className="text-gray-400 text-sm font-medium">No notifications here</p>
            <p className="text-gray-600 text-xs">
              {activeTab === 'unread' ? 'All caught up!' : 'Nothing to display for this filter.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
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

