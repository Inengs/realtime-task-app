import { stats, recentTasks, progress } from "../../mocks/dashboard";
import StatCard from "./components/StatCard";
import ProgressRing from "./components/ProgressRing";
import TaskList from "./components/TaskList";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Section 1: Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Section 2: TaskList + ProgressRing (2/3 + 1/3 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TaskList tasks={recentTasks} />
        </div>
        <div className="lg:col-span-1">
          <ProgressRing completed={progress.completed} total={progress.total} />
        </div>
      </div>

      {/* Section 3: TrendChart + UpcomingTasks + TeamActivity — coming next */}
    </div>
  );
}