// Profile.jsx
import React from "react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const StatTile = ({ label, value }) => (
  <div className="bg-gray-50 rounded-2xl p-3 text-center">
    <p className="text-lg font-bold text-emerald-600">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">
      {label}
    </p>
  </div>
);

const ActionButton = ({ icon, label, primary }) => (
  <button
    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition ${
      primary
        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200"
        : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
    }`}
  >
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {label}
  </button>
);

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const user = {
    name: authUser?.username || authUser?.name || "Alex Johnson",
    role: authUser?.role || "Project Manager",
    availability: "9:00 AM - 5:00 PM",
    email: authUser?.email || "alex.johnson@taskflow.com",
    avatar: authUser?.avatar || null,
    bio: "Building things that ship. Coffee-driven. Passionate about clean workflows and even cleaner dashboards.",
  };

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={3}
        onSearchChange={() => {}}
        user={user}
        searchQuery=""
      />

      <main className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Cover + avatar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-28 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
          </div>

          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">{initials}</span>
                </div>
              )}
              <button className="px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition mb-2">
                Edit Profile
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mt-3">{user.name}</h1>
            <p className="text-emerald-600 text-sm font-medium">{user.role}</p>
            <p className="text-gray-500 text-sm mt-1">{user.bio}</p>

            {/* meta row */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              <StatTile label="Projects" value="12" />
              <StatTile label="Tasks" value="48" />
              <StatTile label="Done" value="92%" />
            </div>

            {/* info rows */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <a href={`mailto:${user.email}`} className="text-sm text-gray-700 hover:text-emerald-600 flex-1 truncate">
                  {user.email}
                </a>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-gray-700 flex-1">Available: {user.availability}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  Online
                </span>
              </div>
            </div>

            {/* actions */}
            <div className="mt-5 flex gap-2">
              <ActionButton
                primary
                icon="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
                label="Call"
              />
              <ActionButton
                icon="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"
                label="Video"
              />
              <ActionButton
                icon="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                label="Chat"
              />
            </div>
          </div>
        </div>

        {/* Skills row */}
        <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {["Productivity", "Sprint Planning", "Agile", "Team Lead", "Notion", "Slack", "Figma"].map(
              (s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100"
                >
                  {s}
                </span>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
