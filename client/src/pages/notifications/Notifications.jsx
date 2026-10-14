import { useNotifications } from "../../contexts/NotificationContext";
import Button from "../../components/Common/Button";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();
  const { user } = useAuth();

  if (!notifications.length) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <Header
          unreadCount={0}
          onSearchChange={() => {}}
          user={user}
          searchQuery=""
        />
        <div className="max-w-2xl mx-auto mt-10 p-4">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Header
        unreadCount={notifications.filter((n) => !n.isRead).length}
        onSearchChange={() => {}}
        user={user}
        searchQuery=""
      />
      <div className="max-w-2xl mx-auto mt-10 p-4">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>

        <Button text="Mark All as Read" onClick={() => markAsRead([])} />

        <ul className="mt-4 space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-3 border rounded-lg shadow-sm ${
                n.isRead ? "bg-gray-100" : "bg-blue-50"
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
    </div>
  );
}
