import { useNavigate } from "react-router-dom";
import type { DashboardTask } from "../../../types/dashboard"
import EmptyState from "./EmptyState";

const priorityStyles = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
} as const;

const statusColors = {
  pending: "bg-gray-300",
  "in-progress": "bg-blue-500",
  done: "bg-emerald-500",
} as const;

function formatDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

export default function TaskList({ tasks }: { tasks: DashboardTask[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {tasks.length > 0 ? `${tasks.length} tasks` : "No tasks yet"}
          </p>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={() => navigate("/tasks")}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            View all →
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="When tasks are created, they'll show up here for your team to track."
          actionLabel="Create task"
          onAction={() => navigate("/tasks/new")}
        />
      ) : (
        <div className="flex-1 divide-y divide-gray-100">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  statusColors[task.status as keyof typeof statusColors] ||
                  "bg-gray-300"
                }`}
              />
              <span className="flex-1 text-sm text-gray-900 truncate">
                {task.title}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  priorityStyles[task.priority as keyof typeof priorityStyles] ||
                  priorityStyles.medium
                }`}
              >
                {task.priority}
              </span>
              <span className="text-xs text-gray-500 w-16 text-right">
                {formatDate(task.due_date)}
              </span>
              {task.assignee ? (
                <img
                  src={
                    task.assignee.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      task.assignee.username
                    )}&background=10b981&color=fff&size=40`
                  }
                  alt={task.assignee.username}
                  className="w-7 h-7 rounded-full object-cover"
                  title={task.assignee.username}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                  ?
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}