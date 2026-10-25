// TaskForm.jsx (TaskPage)
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import NewTaskModal from "../../components/NewTaskModal";
import UpcomingTasks from "../../components/UpcomingTasks";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DayPill = ({ day, date, active }) => (
  <button
    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition ${
      active
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
        : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
    }`}
  >
    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
      {day}
    </span>
    <span className="text-sm font-bold">{date}</span>
  </button>
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
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [unreadCount] = useState(0);
  const [taskFilter, setTaskFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/");
        setTasks(response.data.tasks || response.data || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskCreated = async () => {
    const response = await api.get("/tasks/");
    setTasks(response.data.tasks || response.data || []);
    setIsModalOpen(false);
  };

  /* derived stats */
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const today = new Date();
  const dayIdx = (today.getDay() + 6) % 7; // Mon=0
  const weekDates = days.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayIdx + i);
    return d.getDate();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        unreadCount={unreadCount}
        onSearchChange={setSearchQuery}
        user={user || { name: "John Doe" }}
        searchQuery={searchQuery}
      />

      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                {tasks.length} tasks · {completed} completed this week
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
              <Donut percent={completionRate} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800">Task Statistics</h3>
                <span className="text-xs text-emerald-600 font-semibold">
                  Last 7 days
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {completed} of {tasks.length} tasks completed — keep it up!
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Top tasks</span>
                  <span className="text-gray-400">Design · Code · Client feedback</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-gray-500">Plan usage</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: "60%" }} />
                </div>
                <button className="text-xs text-emerald-600 font-semibold hover:underline whitespace-nowrap">
                  UPGRADE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Week strip */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">This Week</h3>
            <span className="text-xs text-gray-400">
              {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {days.map((d, i) => (
              <DayPill key={d} day={d} date={weekDates[i]} active={i === dayIdx} />
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
          <UpcomingTasks
            tasks={tasks}
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {isModalOpen && (
          <NewTaskModal onClose={() => setIsModalOpen(false)} onCreated={handleTaskCreated} />
        )}
      </main>
    </div>
  );
}

export default TaskPage;
