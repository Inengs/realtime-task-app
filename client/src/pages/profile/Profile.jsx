// Profile.jsx
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const toArray = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];

// API may send is_read (snake_case) or isRead (camelCase)
const isUnread = (n) => !(n.is_read ?? n.isRead);

const Stat = ({ label, value, accent = "text-emerald-600" }) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
      {label}
    </p>
    <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
  </div>
);

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right break-all">
      {children}
    </span>
  </div>
);

export default function Profile() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get("/projects/")
      .then((r) => setProjects(toArray(r.data, "projects")))
      .catch((e) => console.error("Failed to fetch projects:", e));
    api
      .get("/tasks/")
      .then((r) => setTasks(toArray(r.data, "tasks")))
      .catch((e) => console.error("Failed to fetch tasks:", e));
    api
      .get(`/notifications/${user.user_id}`)
      .then((r) => setNotifications(toArray(r.data, "notifications")))
      .catch((e) => console.error("Failed to fetch notifications:", e));
  }, [user?.user_id]);

  if (!user) return <p className="p-8 text-gray-600">Please log in to view your profile.</p>;

  const displayName = user.username || user.name || user.full_name || "User";
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const verified = user.is_verified ?? user.email_verified;
  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={notifications.filter(isUnread).length}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
      />

      <main className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* identity */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-200/50">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold ring-4 ring-white/30">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                {displayName}
              </h1>
              {user.email && (
                <p className="text-emerald-50 text-sm mt-1 truncate">{user.email}</p>
              )}
              {joined && (
                <p className="text-emerald-100 text-xs mt-1">Member since {joined}</p>
              )}
            </div>
          </div>
        </div>

        {/* real stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <Stat label="Projects" value={projects.length} />
          <Stat label="Tasks" value={tasks.length} accent="text-teal-600" />
          <Stat label="Done" value={done} />
          <Stat label="In progress" value={inProgress} accent="text-cyan-600" />
        </div>

        <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Completion rate</h3>
            <span className="text-emerald-600 font-bold">{rate}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {done} of {tasks.length} tasks completed
          </p>
        </div>

        {/* account details: only real fields */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1">Account</h3>
          <Row label="Username">{displayName}</Row>
          {user.email && <Row label="Email">{user.email}</Row>}
          {verified !== undefined && (
            <Row label="Email status">
              {verified ? (
                <span className="text-emerald-600">Verified</span>
              ) : (
                <span className="text-amber-600">Not verified</span>
              )}
            </Row>
          )}
        </div>

        {typeof logout === "function" && (
          <button
            onClick={logout}
            className="mt-6 w-full sm:w-auto px-5 py-2.5 rounded-full border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition"
          >
            Log out
          </button>
        )}
      </main>
    </div>
  );
}