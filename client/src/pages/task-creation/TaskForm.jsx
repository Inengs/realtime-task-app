// src/pages/Tasks/TaskForm.jsx (TaskPage)
import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks, filterTasks } from "../../hooks/useTasks";
import { useNotifications } from "../../contexts/NotificationContext";
import { Spinner, ErrorBanner, EmptyState } from "../../components/StateViews";
import Header from "../../components/Header";
import NewTaskModal from "../../components/NewTaskModal";
import UpcomingTasks from "../../components/UpcomingTasks";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Local YYYY-MM-DD, so "due today" matches the user's calendar day
const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DayPill = ({ day, date, active, count }) => (
  <div
    className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition ${
      active
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
        : "bg-white border border-gray-200 text-gray-600"
    }`}
  >
    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
      {day}
    </span>
    <span className="text-sm font-bold">{date}</span>
    {count > 0 && (
      <span
        title={`${count} due`}
        className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
          active ? "bg-white text-emerald-700" : "bg-emerald-500 text-white"
        }`}
      >
        {count}
      </span>
    )}
  </div>
);

const Donut = ({ percent, size = 80, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#donut-g)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <defs>
        <linearGradient id="donut-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="700"
        fill="#064e3b"
      >
        {percent}%
      </text>
    </svg>
  );
};

function TaskPage() {
  const { user, isAuthenticated } = useAuth();
  const { tasks, stats, loading, error, retry, reload } = useTasks({
    enabled: isAuthenticated,
    live: true,
  });

  // Unread badge comes from the shared NotificationProvider
  const notifications = useNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(
    () => filterTasks(tasks, { status: taskFilter, query: searchQuery }),
    [tasks, taskFilter, searchQuery]
  );

  // Week strip: how many open tasks are due on each day of this week
  const today = new Date();
  const dayIdx = (today.getDay() + 6) % 7; // Mon = 0
  const week = useMemo(() => {
    const dueCounts = {};
    tasks.forEach((t) => {
      if (!t.due_date || t.status === "done") return;
      const d = new Date(t.due_date);
      if (isNaN(d)) return;
      const k = dayKey(d);
      dueCounts[k] = (dueCounts[k] || 0) + 1;
    });
    return DAYS.map((label, i) => {
      const d = new Date();
      d.setDate(d.getDate() - dayIdx + i);
      return { label, date: d.getDate(), count: dueCounts[dayKey(d)] || 0 };
    });
  }, [tasks, dayIdx]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={unreadCount}
        onSearchChange={setSearchQuery}
        user={user}
        searchQuery={searchQuery}
      />

      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onRetry={retry} />
          </div>
        )}

        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-emerald-50 text-xs uppercase tracking-widest font-semibold">
                Your tasks
              </p>
              <h1 className="text-3xl font-bold mt-1">Get things done.</h1>
              <p className="text-emerald-50 text-sm mt-1">
                {loading
                  ? "Loading tasks…"
                  : `${stats.total} tasks · ${stats.done} completed`}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition shadow-md"
            >
              <span className="text-lg leading-none">+</span> Add Task
            </button>
          </div>
        </div>

        {/* Stat card with donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <Donut percent={stats.completionRate} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800">Task Statistics</h3>
                <span className="text-xs text-emerald-600 font-semibold">All time</span>
              </div>
              <p className="text-sm text-gray-500">
                {stats.done} of {stats.total} tasks completed
              </p>

              <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>

              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>
                  <b className="text-gray-700">{stats.pending}</b> pending
                </span>
                <span>
                  <b className="text-gray-700">{stats.inProgress}</b> in progress
                </span>
                <span>
                  <b className="text-gray-700">{stats.done}</b> done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Week strip */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">This Week</h3>
            <span className="text-xs text-gray-400">
              {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })} · open
              tasks due per day
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pt-2 pr-2">
            {week.map((d, i) => (
              <DayPill
                key={d.label}
                day={d.label}
                date={d.date}
                count={d.count}
                active={i === dayIdx}
              />
            ))}
          </div>
        </div>

        {/* Add task (mobile) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="sm:hidden mt-4 w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
        >
          + Add New Task
        </button>

        {/* Upcoming tasks list */}
        <div className="mt-6">
          {loading ? (
            <Spinner card label="Loading tasks…" />
          ) : tasks.length === 0 ? (
            error ? null : (
              <EmptyState
                kind="tasks"
                title="No tasks yet"
                text="Add your first task to get started."
                actionLabel="Add task"
                onAction={() => setIsModalOpen(true)}
              />
            )
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

        {isModalOpen && (
          <NewTaskModal
            onClose={() => setIsModalOpen(false)}
            onCreated={() => {
              reload();
              setIsModalOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default TaskPage;