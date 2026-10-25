// DashboardPage.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import ActiveProjects from "../../components/ActiveProjects";
import UpcomingTasks from "../../components/UpcomingTasks";
import NewProjectModal from "../../components/NewProjectModal";
import NewTaskModal from "../../components/NewTaskModal";
import Header from "../../components/Header";

/* ---------- helpers ---------- */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

const formatDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const StatCard = ({ label, value, sub, accent = "emerald" }) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
      {label}
    </p>
    <p
      className={`text-3xl font-bold mt-1 ${
        accent === "emerald"
          ? "text-emerald-600"
          : accent === "teal"
          ? "text-teal-600"
          : "text-cyan-600"
      }`}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => taskFilter === "All" || t.status === taskFilter)
      .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, taskFilter, searchQuery]);

  /* ---------- fetchers ---------- */
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/");
      setTasks(res.data.tasks || res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/${user?.user_id}`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  /* ---------- websockets ---------- */
  useEffect(() => {
    if (!user) return;
    fetchProjects();
    fetchTasks();
    fetchNotifications();

    const WS_URL =
      import.meta.env.VITE_WS_URL || "wss://taskflow-api.inengiyeemmanuel.site";

    const projectSocket = new WebSocket(`${WS_URL}/ws/projects/`);
    const taskSocket = new WebSocket(`${WS_URL}/ws/tasks/`);
    const notifSocket = new WebSocket(`${WS_URL}/ws/notifications/`);

    projectSocket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "project_created")
        setProjects((prev) => [...prev, msg.data]);
      if (msg.type === "project_updated")
        setProjects((prev) =>
          prev.map((p) => (p.id === msg.data.id ? msg.data : p))
        );
      if (msg.type === "project_deleted")
        setProjects((prev) => prev.filter((p) => p.id !== msg.data.id));
    };

    taskSocket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "task_created") setTasks((prev) => [...prev, msg.data]);
      if (msg.type === "task_updated")
        setTasks((prev) =>
          prev.map((t) => (t.id === msg.data.id ? msg.data : t))
        );
      if (msg.type === "task_deleted")
        setTasks((prev) => prev.filter((t) => t.id !== msg.data.id));
    };

    notifSocket.onmessage = () => fetchNotifications();

    return () => {
      projectSocket.close();
      taskSocket.close();
      notifSocket.close();
    };
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-medium">
          Loading TaskFlow…
        </div>
      </div>
    );
  if (!user) return <p className="p-8 text-gray-600">Please log in to view the dashboard.</p>;

  /* ---------- derived stats ---------- */
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const recentTasks = [...tasks].slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={notifications.length}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
      />

      <main className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* ----- Greeting hero ----- */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-200/50 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 bg-emerald-300/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-emerald-50 text-sm font-medium">
              {formatDate()}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
              {getGreeting()}, {user?.username || user?.name || "there"} 👋
            </h1>
            <p className="text-emerald-50 mt-2 text-base">
              Let's build something great today!
            </p>
          </div>
        </div>

        {/* ----- Stats row ----- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <StatCard label="Active Projects" value={projects.length} sub="in progress" />
          <StatCard label="Total Tasks" value={tasks.length} sub="all time" accent="teal" />
          <StatCard label="Completed" value={completedTasks} sub="this week" accent="emerald" />
          <StatCard label="In Progress" value={inProgress} sub="active now" accent="cyan" />
        </div>

        {/* ----- Action buttons ----- */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition shadow-sm"
          >
            <span className="text-lg leading-none">+</span> New Project
          </button>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
          >
            <span className="text-lg leading-none">+</span> New Task
          </button>
        </div>

        {/* ----- Active projects + recent tasks ----- */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <ActiveProjects projects={projects} />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Recent Tasks</h3>
              <span className="text-xs text-emerald-600 font-semibold">
                View all
              </span>
            </div>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No tasks yet — create your first one!
              </p>
            ) : (
              <ul className="space-y-3">
                {recentTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        t.status === "Completed"
                          ? "bg-emerald-500"
                          : t.status === "In Progress"
                          ? "bg-amber-400"
                          : "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-400">{t.status || "—"}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {t.due_date
                        ? new Date(t.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ----- Upcoming tasks full width ----- */}
        <div className="mt-6">
          <UpcomingTasks
            tasks={filteredTasks}
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* ----- Progress strip ----- */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Weekly Progress</h3>
            <span className="text-emerald-600 font-bold text-lg">
              {completionRate}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedTasks} of {tasks.length} tasks completed this week
          </p>
        </div>

        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onCreated={fetchProjects}
          />
        )}
        {showNewTaskModal && (
          <NewTaskModal
            onClose={() => setShowNewTaskModal(false)}
            onCreated={fetchTasks}
          />
        )}
      </main>
    </div>
  );
}
