import type { ActivityItem } from "../../../mocks/dashboard";

// Action verb → past tense label
const actionLabels = {
  completed: "completed",
  commented: "commented on",
  assigned:  "was assigned to",
  created:   "created",
};

// Action → color of the small action badge
const actionColors = {
  completed: "bg-emerald-50 text-emerald-700",
  commented: "bg-blue-50 text-blue-700",
  assigned:  "bg-purple-50 text-purple-700",
  created:   "bg-amber-50 text-amber-700",
};

export default function TeamActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Team Activity</h3>
          <p className="text-xs text-gray-500 mt-0.5">Recent updates</p>
        </div>
        {/* "Live" indicator — visual cue for future real-time updates */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Activity feed */}
      <div className="flex-1 divide-y divide-gray-100">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-3 px-5 py-3">
            {/* Avatar */}
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">
                  {item.user.name}
                </span>{" "}
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-xs ${actionColors[item.action]}`}
                >
                  {actionLabels[item.action]}
                </span>{" "}
                <span className="text-gray-700">{item.target}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}