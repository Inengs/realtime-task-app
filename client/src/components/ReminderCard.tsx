import { useState } from "react";
import type { Reminder }  from "../types/reminder";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const VideoIcon = () => (
  <svg {...iconProps}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const TaskIcon = () => (
  <svg {...iconProps}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const UserPlusIcon = () => (
  <svg {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const ClockIcon = () => (
  <svg {...iconProps} width={16} height={16}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const CloseIcon = () => (
  <svg {...iconProps} width={14} height={14}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// What kind of reminder it is: label and icon
const KINDS = {
  meeting: { label: "Meeting", icon: <VideoIcon /> },
  task: { label: "Task due", icon: <TaskIcon /> },
  onboarding: { label: "Onboarding", icon: <UserPlusIcon /> },
};

// How urgent it is: colour. later = calm, soon = amber, overdue = red
const TONES = {
  later: {
    card: "border-emerald-200 bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-700",
    chip: "bg-emerald-100 text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  soon: {
    card: "border-amber-200 bg-amber-50",
    icon: "bg-amber-100 text-amber-700",
    chip: "bg-amber-100 text-amber-800",
    button: "bg-amber-500 hover:bg-amber-600",
  },
  overdue: {
    card: "border-red-200 bg-red-50",
    icon: "bg-red-100 text-red-700",
    chip: "bg-red-100 text-red-700",
    button: "bg-red-600 hover:bg-red-700",
  },
};

type ReminderCardProps = {
  reminders?: Reminder[];
  onAction?: (reminder: Reminder) => void;
  onDismiss?: (id: Reminder["id"]) => void;
  onSnooze?: (id: Reminder["id"]) => void;
  initialIndex?: number;
};

/**
 * Small reminder card for the bottom of the sidebar. Shows one reminder at a time.
 *
 * reminders: [{ id, kind: "meeting"|"task"|"onboarding", urgency?: "later"|"soon"|"overdue",
 *               title, detail, when, actionLabel }]
 */
export default function ReminderCard({
  reminders = [],
  onAction,
  onDismiss,
  onSnooze,
  initialIndex = 0,
}: ReminderCardProps) {
  const [index, setIndex] = useState(initialIndex);
  if (reminders.length === 0) return null;

  const i = Math.min(index, reminders.length - 1);
  const current = reminders[i];
  const kind = KINDS[current.kind] ?? KINDS.task;
  const tone = TONES[current.urgency ?? "later"];

  return (
    <section
      aria-live="polite"
      aria-label="Reminders"
      className={`rounded-2xl border p-3 ${tone.card}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
        >
          {kind.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.chip}`}
            >
              {current.when}
            </span>
            <button
              type="button"
              aria-label="Dismiss reminder"
              onClick={() => onDismiss?.(current.id)}
              className="rounded-md p-1 text-gray-400 transition hover:bg-white/70 hover:text-gray-600"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {kind.label}
          </p>
          <p className="line-clamp-2 text-sm font-semibold text-gray-900">{current.title}</p>
          <p className="text-xs text-gray-600">{current.detail}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAction?.(current)}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition ${tone.button}`}
        >
          {current.actionLabel}
        </button>
        <button
          type="button"
          aria-label="Remind me again in 10 minutes"
          title="Remind me in 10 min"
          onClick={() => onSnooze?.(current.id)}
          className="rounded-xl border border-black/10 bg-white/70 p-2.5 text-gray-600 transition hover:bg-white"
        >
          <ClockIcon />
        </button>
      </div>

      {reminders.length > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {reminders.map((r, n) => (
              <button
                key={r.id}
                type="button"
                aria-label={`Show reminder ${n + 1} of ${reminders.length}`}
                onClick={() => setIndex(n)}
                className={`h-1.5 rounded-full transition-all ${
                  n === i ? "w-5 bg-gray-700" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {i + 1} of {reminders.length}
          </span>
        </div>
      )}
    </section>
  );
}