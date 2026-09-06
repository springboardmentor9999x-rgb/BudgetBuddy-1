import React from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { PageHeader } from './PageHeader';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } = useBudget();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title={
          <>
            <Bell className="w-6 h-6 text-indigo-400" />
            Notifications {unreadCount > 0 && <span className="ml-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold align-middle">{unreadCount} New</span>}
          </>
        }
        subtitle="Review your alerts, warnings, and system messages."
        primaryAction={
          <div className="flex gap-2">
            <button 
              onClick={markAllNotificationsAsRead}
              className="btn-secondary-glass text-xs sm:text-sm py-2 px-4 cursor-pointer flex items-center gap-2"
              title="Mark all as read"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
            <button 
              onClick={clearAllNotifications}
              className="btn-secondary-glass text-xs sm:text-sm py-2 px-4 cursor-pointer flex items-center gap-2 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        }
      />

      <div className="glass-card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">You have no notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {notifications.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((notif) => (
              <div 
                key={notif.id}
                onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                className={`p-5 flex gap-4 transition-colors cursor-pointer ${
                  notif.isRead ? 'opacity-60 hover:bg-slate-800/40' : 'bg-slate-800/20 hover:bg-slate-800/40'
                }`}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`text-base font-semibold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 max-w-3xl">{notif.message}</p>
                  <p className="text-[11px] text-slate-500 mt-3 font-mono-code flex items-center gap-2">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
