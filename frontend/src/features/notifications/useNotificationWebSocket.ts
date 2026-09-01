import { useEffect, useRef } from 'react';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useNotificationStore } from './useNotificationStore';
import type { AppNotification } from './useNotificationStore';

function getWsUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  let wsUrl = apiBase;
  if (wsUrl.startsWith('http://')) {
    wsUrl = 'ws://' + wsUrl.slice(7);
  } else if (wsUrl.startsWith('https://')) {
    wsUrl = 'wss://' + wsUrl.slice(8);
  } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${wsProto}//${window.location.host}${wsUrl}`;
  }
  return `${wsUrl}/ws/notifications`;
}

/**
 * useNotificationWebSocket
 * Global hook that maintains an authenticated real-time WebSocket connection to FastAPI.
 * Listens for push notifications (budget warnings, goal milestones, overdrafts, deficits)
 * and dispatches them into useNotificationStore.
 */
export function useNotificationWebSocket() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    isUnmountingRef.current = false;

    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    function connect() {
      if (isUnmountingRef.current) return;

      try {
        const url = getWsUrl();
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
          retryCountRef.current = 0;
          // Start keepalive ping every 25 seconds
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = window.setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data || typeof data !== 'object') return;

            // Handle ping/pong keepalive
            if (data.type === 'pong') return;

            // Process incoming notification
            if (data.title && data.message) {
              addNotification({
                type: data.type || 'info',
                title: data.title,
                message: data.message,
                dedupKey: data.dedupKey,
                showToast: data.showToast ?? false,
              } as Omit<AppNotification, 'id' | 'timestamp' | 'read'>);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket notification payload:', err);
          }
        };

        ws.onerror = (event) => {
          console.warn('WebSocket notification error:', event);
        };

        ws.onclose = () => {
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }

          // Auto-reconnect with exponential backoff if still mounted and logged in
          if (!isUnmountingRef.current && useAuthStore.getState().user) {
            const delay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 15000);
            retryCountRef.current += 1;
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, delay);
          }
        };
      } catch (err) {
        console.error('WebSocket connection initialization error:', err);
      }
    }

    connect();

    return () => {
      isUnmountingRef.current = true;
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user, addNotification]);
}
