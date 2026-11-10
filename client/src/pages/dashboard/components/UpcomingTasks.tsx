import { useNavigate } from "react-router-dom";
import type { UpcomingTask } from "../../../types/dashboard"
import EmptyState from "./EmptyState";

const priorityStyles = {
  high:   "bg-red-500",
  medium: "bg-amber-500",
  low:    "bg-blue-500",
} as const;

const dueInStyles: Record<string, string> = {
  today:    "text-red-600 font-medium",
  tomorrow: "text-amber-600 font-medium",
};

export default function UpcomingTasks({ tasks }: { tasks: UpcomingTask[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Upcoming</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {tasks.length > 0 ? "Due soon" : "Nothing due soon"}
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
          title="You're all caught up"
          description="No tasks due in the next 7 days. Nice work!"
        />
      ) : (
        <div className="flex-1 divide-y divide-gray-100">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm text-gray-900 truncate flex-1">
                  {task.title}
                </span>
                <span className={`text-xs ${dueInStyles[task.due_in] || "text-gray-500"}`}>
                  {task.due_in}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles[task.priority as keyof typeof priorityStyles] || priorityStyles.medium}`} />
                <span className="text-xs text-gray-500">{task.project}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}