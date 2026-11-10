import type { DashboardActivityItem } from "../../../types/dashboard";
import EmptyState from "./EmptyState";

const actionLabels: Record<string, string> = {
  completed: "completed",
  commented: "commented on",
  assigned: "was assigned to",
  created: "created",
  updated: "updated",
  started: "started",
  deleted: "deleted",
};

const actionColors: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  commented: "bg-blue-50 text-blue-700",
  assigned: "bg-purple-50 text-purple-700",
  created: "bg-amber-50 text-amber-700",
  updated: "bg-gray-100 text-gray-700",
  started: "bg-blue-50 text-blue-700",
  deleted: "bg-red-50 text-red-700",
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

export default function TeamActivity({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Team Activity</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {activities.length > 0 ? "Recent updates" : "No recent activity"}
          </p>
        </div>
        {activities.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        )}
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Activity from your team — comments, completed tasks, and assignments — will appear here."
        />
      ) : (
        <div className="flex-1 divide-y divide-gray-100">
          {activities.map((item) => (
            <div key={item.id} className="flex gap-3 px-5 py-3">
              {item.avatar_url ? (
                <img
                  src={item.avatar_url}
                  alt={item.user_name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {getInitials(item.user_name)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">
                    {item.user_name}
                  </span>{" "}
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                      actionColors[item.action] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {actionLabels[item.action] || item.action}
                  </span>{" "}
                  <span className="text-gray-700">{item.target}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}