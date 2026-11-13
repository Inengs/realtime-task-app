import { Link, useParams } from "react-router-dom";
import { useProject } from "../../hooks/useProject";
import ProjectHeader from "./components/ProjectHeader";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading, error, notFound, refetch } = useProject(Number(projectId));

  if (loading) {
    return <div className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />;
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-xl">
        <p className="text-sm font-medium text-gray-900">Project not found</p>
        <p className="mt-1 text-sm text-gray-500">
          It may have been deleted, or you may not be a member.
        </p>
        <Link to="/projects" className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          Back to projects
        </Link>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl">
        <p className="mb-4 text-sm text-gray-600">{error ?? "Failed to load project"}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      <div className="py-20 text-sm text-center text-gray-400 border border-gray-200 border-dashed rounded-xl">
        Tasks board coming next
      </div>
    </div>
  );
}