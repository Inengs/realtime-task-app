import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ProgressRingProps {
  completed: number;
  total: number;
}

export default function ProgressRing({ completed, total }: ProgressRingProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(0, total - completed);

  // Recharts needs data in this shape
  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];

  const COLORS = {
    done: "#10b981",     // emerald-500
    remaining: "#e5e7eb", // gray-200
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Overall Progress</h3>
        <span className="text-xs text-gray-500">All projects</span>
      </div>

      {/* Chart container with centered label */}
      <div className="relative flex-1 flex items-center justify-center min-h-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={60}      // makes it a donut, not a pie
              outerRadius={80}
              startAngle={90}       // start from top
              endAngle={-270}       // full circle clockwise
              paddingAngle={2}      // small gap between segments
              stroke="none"
            >
              <Cell fill={COLORS.done} />
              <Cell fill={COLORS.remaining} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered percentage label — absolutely positioned over the chart */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-semibold text-gray-900 tabular-nums">
            {percentage}%
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {completed} of {total} done
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs text-gray-600">Completed ({completed})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
          <span className="text-xs text-gray-600">Remaining ({remaining})</span>
        </div>
      </div>
    </div>
  );
}