import { TaskUserBrief } from "../../../types/dashboard";

const colors = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
]

interface AvatarStackProps{
  members: TaskUserBrief[];
  total: number; // full member count; can exceed members.length
}

export default function AvatarStack({members, total}: AvatarStackProps) {
    const extra = total - members.length

    return (
    <div className="flex items-center -space-x-2">
      {members.map((m) =>
        m.avatar_url ? (
          <img
            key={m.id}
            src={m.avatar_url}
            alt={m.username}
            className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
          />
        ) : (
          <span
            key={m.id}
            title={m.username}
            className={`flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white text-[10px] font-semibold text-white ${colors[m.id % colors.length]}`}
          >
            {m.username.slice(0, 2).toUpperCase()}
          </span>
        )
      )}
      {extra > 0 && (
        <span className="flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white bg-gray-100 text-[10px] font-semibold text-gray-600">
          +{extra}
        </span>
      )}
    </div>
  );
}