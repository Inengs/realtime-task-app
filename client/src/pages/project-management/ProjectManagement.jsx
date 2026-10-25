// ProjectManagement.jsx
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import NewProjectModal from "../../components/NewProjectModal";
import ActiveProjects from "../../components/ActiveProjects";
import api from "../../services/api";

const TeamAvatar = ({ letter, color = "emerald" }) => (
  <div
    className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm -ml-2 first:ml-0 ${
      color === "emerald"
        ? "bg-emerald-500"
        : color === "teal"
        ? "bg-teal-500"
        : color === "cyan"
        ? "bg-cyan-500"
        : "bg-amber-500"
    }`}
  >
    {letter}
  </div>
);

const TimelineBar = ({ label, percent }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-400">{percent}%</span>
    </div>
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState({ name: "John Doe" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
    setShowModal(false);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={unreadCount}
        onSearchChange={setSearchQuery}
        user={user}
        searchQuery={searchQuery}
      />

      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Hero header */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <p className="text-emerald-50 text-xs uppercase tracking-widest font-semibold">
              Overview
            </p>
            <h1 className="text-3xl font-bold mt-1">Project Management</h1>
            <p className="text-emerald-50 text-sm mt-1">
              Track timelines, manage tasks, and collaborate with your team.
            </p>
          </div>
        </div>

        {/* Project grid */}
        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          {/* Timeline card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Project Timeline</h3>
              <span className="text-xs text-emerald-600 font-semibold">This week</span>
            </div>
            <div className="space-y-4">
              <TimelineBar label="App Redesign" percent={78} />
              <TimelineBar label="Web Update" percent={45} />
              <TimelineBar label="Dashboard" percent={20} />
              <TimelineBar label="API Polish" percent={92} />
            </div>
          </div>

          {/* Current tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Current Tasks</h3>
              <span className="text-xs text-gray-400">4 active</span>
            </div>
            <ul className="space-y-2.5">
              {[
                { name: "Design Mockups", status: "In Progress", color: "amber" },
                { name: "Login Screen", status: "Completed", color: "emerald" },
                { name: "Testing Phase", status: "Not Started", color: "gray" },
                { name: "API Integration", status: "In Progress", color: "amber" },
              ].map((t) => (
                <li
                  key={t.name}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <span className="text-sm font-medium text-gray-700">{t.name}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${
                      t.color === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : t.color === "emerald"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Team members */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Team Members</h3>
              <button className="text-xs text-emerald-600 font-semibold hover:underline">
                + Invite
              </button>
            </div>
            <ul className="space-y-3">
              {[
                { name: "Alex Johnson", role: "Project Manager", letter: "A", color: "emerald" },
                { name: "Bea Lin", role: "Designer", letter: "B", color: "teal" },
                { name: "Carlos Reyes", role: "Engineer", letter: "C", color: "cyan" },
              ].map((m) => (
                <li key={m.name} className="flex items-center gap-3">
                  <TeamAvatar letter={m.letter} color={m.color} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
          >
            <span className="text-lg leading-none">+</span> Edit Project Details
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition shadow-sm">
            Export
          </button>
        </div>

        {/* Active projects list */}
        <div className="mt-6">
          <ActiveProjects projects={filteredProjects} />
        </div>

        {/* Edit panel */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Quick Edit</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Project name"
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Owner"
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm"
            />
            <textarea
              placeholder="Project description"
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition">
              Save Changes
            </button>
            <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>

        {showModal && (
          <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />
        )}
      </main>
    </div>
  );
};

export default ProjectManagementPage;
