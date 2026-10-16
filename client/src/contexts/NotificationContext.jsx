import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api"

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ user, children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch existing notifications (REST)
    const fetchNotifications = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            const res = await api.get(`/notifications/${user.user_id}`);
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.notifications.filter((n) => !n.isRead).length);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    }, [user]);

    const markAsRead = async (ids = []) => {
        if (!user?.user_id) return;
        try {
            await api.patch(`/notifications/read/${user.user_id}`, { notificationIDs: ids });
            setNotifications((prev) =>
                prev.map((n) => (ids.length === 0 || ids.includes(n.id) ? { ...n, isRead: true } : n))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking notifications read", err);
        }
    };

    // WebSocket setup
    useEffect(() => {
        if (!user?.id) return;

        // Connect to WebSocket
        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/notifications`);

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "notification") {
                    setNotifications((prev) => [msg.data, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            } catch (err) {
                console.error("WebSocket parse error:", err);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error", err);

        return () => {
            ws.close();
        };
    }, [user]);

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
