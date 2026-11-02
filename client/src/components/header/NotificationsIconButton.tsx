import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationsIconButton() {
  const navigate = useNavigate();
  // Placeholder: in production, this comes from your API / WebSocket
  const [unreadCount, setUnreadCount] = useState<number>(3);

  function handleClick() {
    navigate("/notifications");
    // Optional: clear badge when user views notifications
    // setUnreadCount(0);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      className="relative flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <Bell className="w-5 h-5" />

      {unreadCount > 0 && (
        <span
          className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full ring-2 ring-white"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}