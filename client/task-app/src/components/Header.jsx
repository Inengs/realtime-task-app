import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

export default function Header({ onSearchChange, user, searchQuery }) {
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    return (
        <div className="fixed top-0 w-full bg-white shadow-md p-4 flex justify-between items-center z-10">
            <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>

            <form className="flex-1 flex justify-center">
                <input
                    type="text"
                    placeholder="Search tasks or projects"
                    className="border rounded px-3 py-1 w-64"
                    onChange={(e) => onSearchChange(e.target.value)}
                    value={searchQuery}
                />
            </form>

            <div className="flex gap-6 items-center">
                <div className="relative cursor-pointer" onClick={() => navigate("/notifications")}>
                    <FiBell size={22} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                )}
            </div>
        </div>
    );
}
