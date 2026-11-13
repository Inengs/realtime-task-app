import { Link } from "react-router-dom";
import { ProjectDetail } from "../../../types/project";
import AvatarStack from "./AvatarStack";

interface ProjectHeaderProps {
  project: ProjectDetail;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const { name, description, member_count, members } = project;

  return (
    <div className="space-y-3">
      <nav className="text-sm text-gray-500">
        <Link to="/projects" className="hover:text-gray-900">
          Projects
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-900">{name}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 truncate">{name}</h1>
          <p className="mt-1 text-sm text-gray-500">{description || "No description"}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AvatarStack members={members} total={member_count} />
          <span className="text-xs text-gray-500">
            {member_count} {member_count === 1 ? "member" : "members"}
          </span>
        </div>
      </div>
    </div>
  );
}