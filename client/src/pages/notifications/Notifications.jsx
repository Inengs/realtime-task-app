// Notifications.jsx
import { useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

// API fields are snake_case (is_read, created_at); camelCase kept as a fallback
const isRead = (n) => Boolean(n.is_read ?? n.isRead);
const createdAt = (n) => n.created_at ?? n.createdAt;

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "task", label: "Tasks" },
  { key: "project", label: "Projects" },
];

const timeAgo = (iso) => {
  const t = new Date(iso).getTime();
  if (!iso || isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const iconFor = (type = "") => {
  if (type.includes("task")) {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type.includes("project")) {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();
  const { user } = useAuth();

  const [tab, setTab] = useState("all");

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  const visible = notifications.filter((n) => {
    if (tab === "unread") return !isRead(n);
    if (tab === "task" || tab === "project") return (n.type ?? "").includes(tab);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={unreadCount}
        onSearchChange={() => {}}
        user={user}
        searchQuery=""
      />

      <main className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {notifications.length === 0
                ? "You're all caught up."
                : `${unreadCount} unread of ${notifications.length} total`}
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => markAsRead([])}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  tab === key
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">No notifications yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              When something happens, you'll see it here.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            Nothing in this view.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {visible.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition cursor-pointer ${
                  isRead(n)
                    ? "bg-white border-gray-100 hover:border-emerald-200"
                    : "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                    isRead(n)
                      ? "bg-gray-100 text-gray-500"
                      : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                  }`}
                >
                  {iconFor(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      isRead(n) ? "text-gray-700" : "text-gray-900 font-semibold"
                    }`}
                  >
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {timeAgo(createdAt(n))}
                    </span>
                    {!isRead(n) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
                {!isRead(n) && (
                  <button
                    onClick={() => markAsRead([n.id])}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}