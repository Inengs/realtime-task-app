import { useNotifications } from "../context/NotificationContext";
import Button from "../components/Button";

export default function NotificationsPage() {
    const { notifications, markAsRead } = useNotifications();

    if (!notifications.length) {
        return <p className="p-4">No notifications yet.</p>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-20 p-4">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>

            <Button text="Mark All as Read" onClick={() => markAsRead([])} />

            <ul className="mt-4 space-y-3">
                {notifications.map((n) => (
                    <li
                        key={n.id}
                        className={`p-3 border rounded-lg shadow-sm ${n.isRead ? "bg-gray-100" : "bg-blue-50"
                            }`}
                    >
                        <p className="text-sm">{n.message}</p>
                        <span className="text-xs text-gray-500">
                            {new Date(n.createdAt).toLocaleString()}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
