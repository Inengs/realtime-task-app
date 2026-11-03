import { stats, recentTasks, progress, taskTrend, upcomingTasks, teamActivity } from "../../mocks/dashboard";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "./components/StatCard";
import ProgressRing from "./components/ProgressRing";
import TaskList from "./components/TaskList";
import TrendChart from "./components/TrendChart";
import UpcomingTasks from "./components/UpcomingTasks";
import TeamActivity from "./components/TeamActivity";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header row: title + New Task button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back — here's what's happening today
          </p>
        </div>
        <button
          onClick={() => navigate("/tasks/new")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Section 1: Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TaskList tasks={recentTasks} />
        </div>
        <div className="lg:col-span-1">
          <ProgressRing completed={progress.completed} total={progress.total} />
        </div>
      </div>

      {/* Section 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart data={taskTrend} />
        </div>
        <div className="lg:col-span-1">
          <UpcomingTasks tasks={upcomingTasks} />
        </div>
      </div>

      {/* Section 3b */}
      <div className="grid grid-cols-1 gap-4">
        <TeamActivity activities={teamActivity} />
      </div>
    </div>
  );
}