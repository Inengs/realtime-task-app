export default function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 h-52 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}