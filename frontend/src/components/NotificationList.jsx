import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiTarget,
  FiFileText,
} from "react-icons/fi";

import {
  getNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();

      const notificationData = Array.isArray(data)
        ? data
        : [];

      setNotifications(notificationData);

      setUnreadCount(
        notificationData.filter(
          (notification) => !notification.is_read
        ).length
      );
    } catch (err) {
      console.error(
        "Unable to fetch notifications:",
        err
      );

      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // MARK NOTIFICATION AS READ
  // ==========================================

  const handleMarkAsRead = async (notificationId) => {
    try {
      const updatedNotification =
        await markNotificationAsRead(
          notificationId
        );

      setNotifications((current) => {
        const updated = current.map(
          (notification) =>
            notification.id === notificationId
              ? updatedNotification
              : notification
        );

        setUnreadCount(
          updated.filter(
            (notification) =>
              !notification.is_read
          ).length
        );

        return updated;
      });
    } catch (err) {
      console.error(
        "Unable to mark notification as read:",
        err
      );
    }
  };

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "budget_alert":
        return <FiAlertCircle />;

      case "goal_milestone":
        return <FiTarget />;

      case "monthly_report":
        return <FiFileText />;

      default:
        return <FiBell />;
    }
  };

  // ==========================================
  // NOTIFICATION TITLE
  // ==========================================

  const getNotificationTitle = (type) => {
    switch (type) {
      case "budget_alert":
        return "Budget Alert";

      case "goal_milestone":
        return "Savings Goal";

      case "monthly_report":
        return "Monthly Report";

      default:
        return "Notification";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiBell />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#071a2b]">
              Notifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Loading your notifications...
            </p>
          </div>

        </div>

        <div className="mt-6 flex items-center justify-center py-8">

          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

        </div>

      </section>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <FiAlertCircle />
          </div>

          <div>

            <h3 className="text-lg font-bold text-[#071a2b]">
              Notifications
            </h3>

            <p className="mt-1 text-sm text-red-500">
              {error}
            </p>

          </div>

        </div>

      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiBell />
          </div>

          <div>

            <h3 className="text-lg font-bold text-[#071a2b]">
              Notifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your latest financial alerts.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {notifications.length}
          </span>

          {unreadCount > 0 && (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
              {unreadCount} unread
            </span>
          )}

        </div>

      </div>

      {/* EMPTY STATE */}

      {notifications.length === 0 ? (

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <FiBell />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-600">
            No notifications yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            New budget alerts, savings milestones,
            and reports will appear here.
          </p>

        </div>

      ) : (

        /* NOTIFICATION LIST */

        <div className="mt-6 space-y-3">

          {notifications.map((notification) => {

            const isUnread =
              !notification.is_read;

            return (
              <div
                key={notification.id}
                className={`rounded-2xl border p-4 transition ${
                  isUnread
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-slate-100 bg-slate-50"
                }`}
              >

                <div className="flex gap-3">

                  {/* ICON */}

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isUnread
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <p
                        className={`text-sm ${
                          isUnread
                            ? "font-bold text-slate-800"
                            : "font-semibold text-slate-600"
                        }`}
                      >
                        {getNotificationTitle(
                          notification.type
                        )}
                      </p>

                      {isUnread && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {notification.message}
                    </p>

                    {notification.created_at && (
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(
                          notification.created_at
                        ).toLocaleString("en-IN")}
                      </p>
                    )}

                    {/* MARK AS READ */}

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
                      >
                        <FiCheck />
                        Mark as read
                      </button>
                    )}

                    {/* READ STATUS */}

                    {!isUnread && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <FiCheckCircle />
                        Read
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

    </section>
  );
}

export default NotificationList;