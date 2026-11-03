// Base skeleton block — animated shimmer
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );
}

// StatCard skeleton — matches the shape of a real StatCard
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="w-10 h-10" />
        <SkeletonBlock className="w-20 h-4" />
      </div>
      <SkeletonBlock className="w-16 h-8 mb-2" />
      <SkeletonBlock className="w-24 h-4" />
    </div>
  );
}

// TaskList skeleton
export function TaskListSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <SkeletonBlock className="w-32 h-5 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="w-2 h-2 rounded-full" />
            <SkeletonBlock className="flex-1 h-4" />
            <SkeletonBlock className="w-12 h-4" />
            <SkeletonBlock className="w-16 h-4" />
            <SkeletonBlock className="w-7 h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic wrapper for the dashboard's loading state
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><TaskListSkeleton /></div>
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 h-full">
            <SkeletonBlock className="w-32 h-5 mb-4" />
            <div className="flex items-center justify-center">
              <SkeletonBlock className="w-40 h-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}