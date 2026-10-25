// ProjectManagement.jsx
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import NewProjectModal from "../../components/NewProjectModal";
import NewTaskModal from "../../components/NewTaskModal";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

/* ---------- helpers ---------- */
const toArray = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];

// API may send is_read (snake_case) or isRead (camelCase)
const isUnread = (n) => !(n.is_read ?? n.isRead);

// Tolerate different field names until the API shape is confirmed
const projectId = (p) => p.id ?? p.project_id;
const projectName = (p) => p.name ?? p.title ?? p.project_name ?? "Untitled project";

const COLUMNS = [
  { key: "pending", label: "Pending", dot: "bg-gray-300" },
  { key: "in-progress", label: "In progress", dot: "bg-amber-400" },
  { key: "done", label: "Done", dot: "bg-emerald-500" },
];

const formatDue = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

export default function ProjectManagement() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const load = async () => {
    try {
      const [p, t] = await Promise.all([api.get("/projects/"), api.get("/tasks/")]);
      setProjects(toArray(p.data, "projects"));
      setTasks(toArray(t.data, "tasks"));
      setError("");
    } catch (err) {
      console.error("Failed to load projects/tasks:", err);
      setError("Couldn't load your projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;
    api
      .get(`/notifications/${user.user_id}`)
      .then((res) => setNotifications(toArray(res.data, "notifications")))
      .catch((err) => console.error("Failed to fetch notifications:", err));
  }, [user?.user_id]);

  /* ---------- derived ---------- */
  const visibleProjects = useMemo(
    () =>
      projects.filter((p) =>
        projectName(p).toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [projects, searchQuery]
  );

  const tasksOf = (id) => tasks.filter((t) => t.project_id === id);
  const progressOf = (id) => {
    const list = tasksOf(id);
    const done = list.filter((t) => t.status === "done").length;
    return {
      total: list.length,
      done,
      pct: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  };

  const selected =
    projects.find((p) => projectId(p) === selectedId) ?? visibleProjects[0] ?? null;
  const selectedTasks = selected ? tasksOf(projectId(selected)) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={notifications.filter(isUnread).length}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
      />

      <main className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Projects
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length} {projects.length === 1 ? "project" : "projects"} ·{" "}
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
          >
            <span className="text-lg leading-none">+</span> New Project
          </button>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={load} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-center text-sm text-emerald-600 animate-pulse">
            Loading projects…
          </p>
        ) : projects.length === 0 && !error ? (
          <div className="mt-8 bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-lg font-semibold text-gray-800">No projects yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Create your first project to start organising tasks.
            </p>
            <button
              onClick={() => setShowProjectModal(true)}
              className="mt-4 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
            >
              Create a project
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            {/* ---- project list ---- */}
            <section className="lg:col-span-1 space-y-3">
              {visibleProjects.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No projects match “{searchQuery}”.
                </p>
              )}
              {visibleProjects.map((p) => {
                const id = projectId(p);
                const { total, done, pct } = progressOf(id);
                const active = selected && projectId(selected) === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={`w-full text-left bg-white rounded-2xl p-4 border transition shadow-sm ${
                      active
                        ? "border-emerald-400 ring-2 ring-emerald-100"
                        : "border-gray-100 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-800 truncate">
                        {projectName(p)}
                      </p>
                      <span className="text-xs font-semibold text-emerald-600">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {done} of {total} tasks done
                    </p>
                  </button>
                );
              })}
            </section>

            {/* ---- selected project ---- */}
            <section className="lg:col-span-2">
              {selected ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 truncate">
                        {projectName(selected)}
                      </h2>
                      {selected.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {selected.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="shrink-0 px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition"
                    >
                      + Add task
                    </button>
                  </div>

                  {selectedTasks.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">
                      No tasks in this project yet.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4 mt-5">
                      {COLUMNS.map((col) => {
                        const items = selectedTasks.filter((t) => t.status === col.key);
                        return (
                          <div key={col.key} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {col.label}
                              </h3>
                              <span className="ml-auto text-xs text-gray-400">
                                {items.length}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {items.map((t) => (
                                <li
                                  key={t.id ?? t.task_id}
                                  className="bg-white rounded-lg p-3 border border-gray-100"
                                >
                                  <p className="text-sm font-medium text-gray-800">
                                    {t.title}
                                  </p>
                                  {t.due_date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Due {formatDue(t.due_date)}
                                    </p>
                                  )}
                                </li>
                              ))}
                              {items.length === 0 && (
                                <li className="text-xs text-gray-300 text-center py-3">
                                  Nothing here
                                </li>
                              )}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          </div>
        )}

        {showProjectModal && (
          <NewProjectModal
            onClose={() => setShowProjectModal(false)}
            onCreated={() => {
              load();
              setShowProjectModal(false);
            }}
          />
        )}
        {showTaskModal && (
          <NewTaskModal
            onClose={() => setShowTaskModal(false)}
            onCreated={() => {
              load();
              setShowTaskModal(false);
            }}
          />
        )}
      </main>
    </div>
  );
}