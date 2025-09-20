import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ user, children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch existing notifications (REST)
    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await axios.get(`/notifications/${user.id}`, { withCredentials: true });
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.notifications.filter((n) => !n.isRead).length);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    }, [user]);

    // Mark notifications read
    const markAsRead = async (ids = []) => {
        if (!user?.id) return;
        try {
            await axios.patch(`/notifications/read/${user.id}`, { notificationIDs: ids }, { withCredentials: true });
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) =>
                    ids.length === 0 || ids.includes(n.id) ? { ...n, isRead: true } : n
                )
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
