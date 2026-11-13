import { useMemo, useState } from "react";
import { FolderOpen, Plus, Search } from "lucide-react";
import { useProjectList } from "../../hooks/useProjectList"
import ProjectCard from "./components/ProjectCard";
import ProjectsSkeleton from "./components/ProjectsSkeleton";
import NewProjectModal from "./components/NewProjectModal";

export default function ProjectsPage() {
  const { projects, loading, error, refetch } = useProjectList();
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects;
  }, [projects, query]);

  return (
    <div className="space-y-6">
      {/* Header row: title + New Project button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? "Loading…"
              : `${projects.length} ${projects.length === 1 ? "project" : "projects"} you're part of`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <ProjectsSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="mb-4 text-sm text-gray-600">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-xl">
          <FolderOpen className="w-10 h-10 mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">No projects yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first project to start organising tasks.
          </p>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-sm">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full py-2 pl-9 pr-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {visible.length === 0 ? (
            <p className="py-10 text-sm text-center text-gray-400">
              No projects match "{query}".
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </>
      )}

      {showNew && (
        <NewProjectModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}