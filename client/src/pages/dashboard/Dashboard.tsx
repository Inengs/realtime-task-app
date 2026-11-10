import { stats, recentTasks, progress, taskTrend, upcomingTasks, teamActivity } from "../../mocks/dashboard";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "./components/StatCard";
import ProgressRing from "./components/ProgressRing";
import TaskList from "./components/TaskList";
import TrendChart from "./components/TrendChart";
import UpcomingTasks from "./components/UpcomingTasks";
import TeamActivity from "./components/TeamActivity";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { StatItem } from "../../types/dashboard";
import { DashboardSkeleton } from "./components/Skeleton";
import { useDashboardRecentTasks } from "../../hooks/useDashboardRecentTasks";
import { useDashboardProgress } from "../../hooks/useDashboardProgress";
import { useDashboardTrend } from "../../hooks/useDashboardTrend";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = useDashboardStats();
  const { tasks, loading: tasksLoading } = useDashboardRecentTasks();
  const { progress } = useDashboardProgress();


  // Loading state — show skeleton
  if (loading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state — show retry button
  if (error || !stats) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-gray-600 mb-4">
          {error || "Failed to load dashboard data"}
        </p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

// ADAPTER
  const statCards: StatItem[] = [
    {
      id: "total",
      label: "Total Tasks",
      value: stats.total,
      delta: Math.abs(stats.deltas.total),
      trend: stats.deltas.total >= 0 ? "up" : "down",
      icon: "list",
    },
    {
      id: "in-progress",
      label: "In Progress",
      value: stats.in_progress,
      delta: Math.abs(stats.deltas.in_progress),
      trend: stats.deltas.in_progress >= 0 ? "up" : "down",
      icon: "loader",
    },
    {
      id: "completed",
      label: "Completed",
      value: stats.completed,
      delta: Math.abs(stats.deltas.completed),
      trend: stats.deltas.completed >= 0 ? "up" : "down",
      icon: "check-circle",
    },
    {
      id: "overdue",
      label: "Overdue",
      value: stats.overdue,
      delta: Math.abs(stats.deltas.overdue),
      trend: stats.deltas.overdue >= 0 ? "up" : "down",
      icon: "alert-circle",
    },
  ];
  
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
        {statCards.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} />
        </div>
        <div className="lg:col-span-1">
          <ProgressRing
            completed={progress?.completed ?? 0}
            total={progress?.total ?? 0}
          />
        </div>
      </div>

      {/* Section 3 */}
      {/* TrendChart — now fetches its own data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart />
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