// src/pages/Dashboard/DashboardPage.jsx
import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks, filterTasks } from "../../hooks/useTasks";
import { useProjects } from "../../hooks/useProjects";
import { useNotifications } from "../../contexts/NotificationContext";
import { Spinner, ErrorBanner, EmptyState } from "../../components/StateViews";
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

const ACCENTS = {
  emerald: "text-emerald-600",
  teal: "text-teal-600",
  cyan: "text-cyan-600",
};

const StatCard = ({ label, value, sub, accent = "emerald" }) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
      {label}
    </p>
    <p className={`text-3xl font-bold mt-1 ${ACCENTS[accent]}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// Status values as stored in the database
const STATUS_DOT = {
  done: "bg-emerald-500",
  "in-progress": "bg-amber-400",
  pending: "bg-gray-300",
};
const STATUS_LABEL = {
  done: "Done",
  "in-progress": "In progress",
  pending: "Pending",
};

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated, displayName } = useAuth();

  // Data + live WebSocket updates (the hooks own the sockets now)
  const {
    tasks,
    stats,
    loading: tasksLoading,
    error: tasksError,
    retry: retryTasks,
    reload: reloadTasks,
  } = useTasks({ enabled: isAuthenticated, live: true });

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    retry: retryProjects,
    reload: reloadProjects,
  } = useProjects({ enabled: isAuthenticated, live: true, tasks });

  // Unread badge comes from the shared NotificationProvider (no second fetch/socket here)
  const notifications = useNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(
    () => filterTasks(tasks, { status: taskFilter, query: searchQuery }),
    [tasks, taskFilter, searchQuery]
  );

  if (authLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-medium">
          Loading TaskFlow…
        </div>
      </div>
    );
  if (!isAuthenticated)
    return <p className="p-8 text-gray-600">Please log in to view the dashboard.</p>;

  const recentTasks = tasks.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={unreadCount}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
      />

      <main className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {(projectsError || tasksError) && (
          <div className="space-y-3 mb-6">
            {projectsError && (
              <ErrorBanner message={projectsError} onRetry={retryProjects} />
            )}
            {tasksError && <ErrorBanner message={tasksError} onRetry={retryTasks} />}
          </div>
        )}

        {/* ----- Greeting hero ----- */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-200/50 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 bg-emerald-300/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-emerald-50 text-sm font-medium">{formatDate()}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
              {getGreeting()}, {displayName || "there"} 👋
            </h1>
            <p className="text-emerald-50 mt-2 text-base">
              Let's build something great today!
            </p>
          </div>
        </div>

        {/* ----- Stats row ----- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <StatCard
            label="Projects"
            value={projectsLoading ? "…" : projects.length}
            sub="all projects"
          />
          <StatCard
            label="Total Tasks"
            value={tasksLoading ? "…" : stats.total}
            sub="all time"
            accent="teal"
          />
          <StatCard
            label="Completed"
            value={tasksLoading ? "…" : stats.done}
            sub="all time"
          />
          <StatCard
            label="In Progress"
            value={tasksLoading ? "…" : stats.inProgress}
            sub="active now"
            accent="cyan"
          />
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

        {/* ----- Projects + recent tasks ----- */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            {projectsLoading ? (
              <Spinner card label="Loading projects…" />
            ) : projects.length === 0 ? (
              projectsError ? null : (
                <EmptyState
                  kind="projects"
                  title="No projects yet"
                  text="Create a project to start organising your tasks."
                  actionLabel="New project"
                  onAction={() => setShowNewProjectModal(true)}
                />
              )
            ) : (
              <ActiveProjects projects={projects} />
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Recent Tasks</h3>
            </div>
            {tasksLoading ? (
              <Spinner label="Loading tasks…" />
            ) : recentTasks.length === 0 ? (
              tasksError ? null : (
                <EmptyState
                  compact
                  kind="tasks"
                  title="No tasks yet"
                  text="Create your first one!"
                />
              )
            ) : (
              <ul className="space-y-3">
                {recentTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        STATUS_DOT[t.status] || "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {STATUS_LABEL[t.status] || t.status || "—"}
                      </p>
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
          {tasksLoading ? (
            <Spinner card label="Loading tasks…" />
          ) : (
            <UpcomingTasks
              tasks={filteredTasks}
              taskFilter={taskFilter}
              setTaskFilter={setTaskFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </div>

        {/* ----- Progress strip ----- */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Overall Progress</h3>
            <span className="text-emerald-600 font-bold text-lg">
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.done} of {stats.total} tasks completed
          </p>
        </div>

        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onCreated={reloadProjects}
          />
        )}
        {showNewTaskModal && (
          <NewTaskModal
            onClose={() => setShowNewTaskModal(false)}
            onCreated={reloadTasks}
          />
        )}
      </main>
    </div>
  );
}