import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardTrend } from "../../../hooks/useDashboardTrend";
import type { DashboardTrendPoint } from "../../../types/dashboard"

type Range = "7d" | "14d" | "30d";

const RANGE_MAP: Record<Range, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length > 0) {
    const point = payload[0].payload as DashboardTrendPoint;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
        <p className="text-gray-500 mb-1">{formatDate(point.date)}</p>
        <p className="font-semibold text-gray-900">
          {point.completed} task{point.completed === 1 ? "" : "s"} completed
        </p>
      </div>
    );
  }
  return null;
}

export default function TrendChart() {
  const [range, setRange] = useState<Range>("14d");
  const days = RANGE_MAP[range];
  const { trend, loading } = useDashboardTrend(days);

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-[240px] bg-gray-50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Task Completion Trend
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Last {days} days</p>
        </div>

        {/* Range toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["7d", "14d", "30d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[240px]">
        {trend.length === 0 ? (
          <div className="flex items-center justify-center h-[240px] text-sm text-gray-400">
            No data for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={range === "30d" ? 3 : 1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={40}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{ r: 5, fill: "#10b981", stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}