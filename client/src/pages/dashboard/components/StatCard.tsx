import { List, Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import type { StatItem } from "../../../mocks/dashboard";

// Map icon string → actual Lucide component
const iconMap = {
  list: List,
  loader: Loader2,
  "check-circle": CheckCircle2,
  "alert-circle": AlertCircle,
};

// Map stat id → subtle color theme (background + icon tint)
const themeMap = {
  total:        { bg: "bg-blue-50",    text: "text-blue-600"    },
  "in-progress": { bg: "bg-purple-50",  text: "text-purple-600"  },
  completed:    { bg: "bg-emerald-50", text: "text-emerald-600" },
  overdue:      { bg: "bg-red-50",     text: "text-red-600"     },
};

export default function StatCard({ stat }: { stat: StatItem }) {
  const Icon = iconMap[stat.icon];
  const theme = themeMap[stat.id];
  const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      {/* Top row: icon + label */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${theme.bg}`}>
          <Icon className={`w-5 h-5 ${theme.text}`} />
        </div>
        <span className="text-sm text-gray-500">{stat.label}</span>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-semibold text-gray-900 tabular-nums">
          {stat.value}
        </span>
        <span className="text-xs text-gray-400">tasks</span>
      </div>

      {/* Trend badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
            stat.trend === "up"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <TrendIcon className="w-3 h-3" />
          {stat.delta}%
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </div>
  );
}