import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { FiBell, FiLogOut } from "react-icons/fi";

function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NavLink
              to="/notifications"
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiBell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </NavLink>

            {/* User Avatar */}
            <NavLink to="/profile">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 hover:border-blue-500 transition"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hover:bg-blue-600 transition">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-red-600 rounded-full transition"
              title="Logout"
            >
              <FiLogOut size={22} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-blue-500"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-blue-500"
              }`
            }
          >
            Projects
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-blue-500"
              }`
            }
          >
            Tasks
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `px-4 py-3 font-medium transition border-b-2 whitespace-nowrap relative ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-blue-500"
              }`
            }
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-blue-500"
              }`
            }
          >
            Profile
          </NavLink>
        </nav>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
