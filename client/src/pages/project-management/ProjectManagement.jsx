// src/pages/Projects/ProjectManagement.jsx
import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { useProjects, projectId, projectName } from "../../hooks/useProjects";
import { useNotifications } from "../../contexts/NotificationContext";
import { Spinner, ErrorBanner, EmptyState } from "../../components/StateViews";
import Header from "../../components/Header";
import NewProjectModal from "../../components/NewProjectModal";
import NewTaskModal from "../../components/NewTaskModal";

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
  const { user, isAuthenticated } = useAuth();

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    retry: retryTasks,
    reload: reloadTasks,
  } = useTasks({ enabled: isAuthenticated, live: true });

  // Passing tasks adds .progress { total, done, pct } to every project
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    retry: retryProjects,
    reload: reloadProjects,
  } = useProjects({ enabled: isAuthenticated, live: true, tasks });

  // Unread badge comes from the shared NotificationProvider
  const notifications = useNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;

  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const loading = projectsLoading || tasksLoading;

  const visibleProjects = useMemo(
    () =>
      projects.filter((p) =>
        projectName(p).toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [projects, searchQuery]
  );

  const selected =
    projects.find((p) => projectId(p) === selectedId) ?? visibleProjects[0] ?? null;
  const selectedTasks = useMemo(
    () => (selected ? tasks.filter((t) => t.project_id === projectId(selected)) : []),
    [tasks, selected]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={unreadCount}
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
              {loading
                ? "Loading…"
                : `${projects.length} ${projects.length === 1 ? "project" : "projects"} · ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
            </p>
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md shadow-emerald-200"
          >
            <span className="text-lg leading-none">+</span> New Project
          </button>
        </div>

        {(projectsError || tasksError) && (
          <div className="mt-6 space-y-3">
            {projectsError && (
              <ErrorBanner message={projectsError} onRetry={retryProjects} />
            )}
            {tasksError && <ErrorBanner message={tasksError} onRetry={retryTasks} />}
          </div>
        )}

        {loading ? (
          <Spinner label="Loading projects…" />
        ) : projects.length === 0 ? (
          projectsError ? null : (
            <div className="mt-8">
              <EmptyState
                kind="projects"
                title="No projects yet"
                text="Create your first project to start organising tasks."
                actionLabel="Create a project"
                onAction={() => setShowProjectModal(true)}
              />
            </div>
          )
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
                const { total, done, pct } = p.progress;
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
              reloadProjects();
              setShowProjectModal(false);
            }}
          />
        )}
        {showTaskModal && (
          <NewTaskModal
            onClose={() => setShowTaskModal(false)}
            onCreated={() => {
              reloadTasks();
              setShowTaskModal(false);
            }}
          />
        )}
      </main>
    </div>
  );
}