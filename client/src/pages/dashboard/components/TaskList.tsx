import { useNavigate } from "react-router-dom";
import type { TaskItem } from "../../../mocks/dashboard";

// Priority badge styles
const priorityStyles = {
  high:   "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low:    "bg-blue-50 text-blue-700 border-blue-200",
};

// Status dot colors
const statusColors = {
  "todo":        "bg-gray-300",
  "in-progress": "bg-blue-500",
  "completed":   "bg-emerald-500",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TaskList({ tasks }: { tasks: TaskItem[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {tasks.length} tasks across all projects
          </p>
        </div>
        <button
          onClick={() => navigate("/tasks")}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          View all →
        </button>
      </div>

      {/* Task rows */}
      <div className="flex-1 divide-y divide-gray-100">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => navigate(`/tasks/${task.id}`)}
            className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {/* Status indicator */}
            <span className={`w-2 h-2 rounded-full ${statusColors[task.status]}`} />

            {/* Title */}
            <span className="flex-1 text-sm text-gray-900 truncate">
              {task.title}
            </span>

            {/* Priority badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}
            >
              {task.priority}
            </span>

            {/* Due date */}
            <span className="text-xs text-gray-500 w-16 text-right">
              {formatDate(task.dueDate)}
            </span>

            {/* Assignee avatar */}
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="w-7 h-7 rounded-full object-cover"
              title={task.assignee.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}