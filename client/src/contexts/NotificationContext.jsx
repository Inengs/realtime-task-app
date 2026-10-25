import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import api from "../services/api";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

// API fields are snake_case (is_read); camelCase kept as a fallback
const isRead = (n) => Boolean(n.is_read ?? n.isRead);

export function NotificationProvider({ user, children }) {
  const [notifications, setNotifications] = useState([]);
  const userId = user?.user_id;

  // Derived, so it can never drift from the list
  const unreadCount = useMemo(
    () => notifications.filter((n) => !isRead(n)).length,
    [notifications]
  );

  // Fetch existing notifications (REST)
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/notifications/${userId}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.notifications)
        ? res.data.notifications
        : [];
      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  }, [userId]);

  // ids = [] means "mark all as read" (same contract as before)
  const markAsRead = async (ids = []) => {
    if (!userId) return;
    try {
      await api.patch(`/notifications/read/${userId}`, { notificationIDs: ids });
      setNotifications((prev) =>
        prev.map((n) =>
          ids.length === 0 || ids.includes(n.id)
            ? { ...n, is_read: true, isRead: true }
            : n
        )
      );
    } catch (err) {
      console.error("Error marking notifications read", err);
    }
  };

  // WebSocket for live notifications
  useEffect(() => {
    if (!userId) return;

    const WS_URL =
      import.meta.env.VITE_WS_URL || "wss://taskflow-api.inengiyeemmanuel.site";
    const ws = new WebSocket(`${WS_URL}/ws/notifications/`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "notification" && msg.data) {
          setNotifications((prev) =>
            prev.some((n) => n.id === msg.data.id) ? prev : [msg.data, ...prev]
          );
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error", err);

    return () => ws.close();
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}