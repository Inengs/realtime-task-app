import { Link } from "react-router-dom";
import { ProjectListItem, ProjectRole } from "../../../types/project";
import AvatarStack from "./AvatarStack";

const roleStyles: Record<ProjectRole, string> = {
  owner: "bg-emerald-50 text-emerald-700",
  admin: "bg-sky-50 text-sky-700",
  member: "bg-gray-100 text-gray-600",
};

interface ProjectCardProps {
  project: ProjectListItem;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { id, name, description, role, task_count, done_count, member_count, members } = project;
  const pct = task_count > 0 ? Math.round((done_count / task_count) * 100) : 0;

  return (
    <Link
      to={`/projects/${id}`}
      className="flex flex-col gap-4 p-5 bg-white border border-gray-200 rounded-xl transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {/* Title + my role */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 truncate" title={name}>
          {name}
        </h3>
        <span
          className={`shrink-0 px-2 py-0.5 text-xs font-medium capitalize rounded-full ${roleStyles[role]}`}
        >
          {role}
        </span>
      </div>

      {/* min-h keeps cards equal height whether or not there is a description */}
      <p className="min-h-10 text-sm text-gray-500 line-clamp-2">
        {description || "No description"}
      </p>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs text-gray-500">
          <span>
            {task_count === 0 ? "No tasks yet" : `${done_count} of ${task_count} tasks done`}
          </span>
          {task_count > 0 && <span className="font-medium text-emerald-600">{pct}%</span>}
        </div>
        <div className="h-1.5 overflow-hidden bg-gray-100 rounded-full">
          <div
            className="h-full transition-all rounded-full bg-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between">
        <AvatarStack members={members} total={member_count} />
        <span className="text-xs text-gray-500">
          {member_count} {member_count === 1 ? "member" : "members"}
        </span>
      </div>
    </Link>
  );
}