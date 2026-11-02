// src/components/StateViews.jsx
// Shared loading / error / empty states.

export function Spinner({ label = "Loading…", card = false }) {
  const body = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-10 text-emerald-600"
    >
      <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
  return card ? (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">{body}</div>
  ) : (
    body
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-full bg-white border border-red-200 px-3 py-1 font-semibold text-red-700 hover:bg-red-100 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}

const Illustration = ({ kind, size }) => {
  const common = { width: size, height: size, viewBox: "0 0 96 96", fill: "none", "aria-hidden": true };
  if (kind === "projects") {
    return (
      <svg {...common}>
        <rect x="14" y="30" width="68" height="46" rx="8" fill="#d1fae5" />
        <path d="M14 38a8 8 0 0 1 8-8h16l8 8h28a8 8 0 0 1 8 8v-8" fill="#a7f3d0" />
        <rect x="14" y="38" width="68" height="38" rx="8" fill="#34d399" opacity="0.35" />
        <rect x="26" y="52" width="30" height="5" rx="2.5" fill="#10b981" />
        <rect x="26" y="62" width="18" height="5" rx="2.5" fill="#6ee7b7" />
      </svg>
    );
  }
  // tasks (default)
  return (
    <svg {...common}>
      <rect x="22" y="14" width="52" height="68" rx="9" fill="#d1fae5" />
      <rect x="34" y="9" width="28" height="12" rx="6" fill="#10b981" />
      <path d="M33 40l5 5 9-10" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="52" y="39" width="14" height="4" rx="2" fill="#6ee7b7" />
      <rect x="33" y="58" width="33" height="4" rx="2" fill="#6ee7b7" />
      <rect x="33" y="68" width="22" height="4" rx="2" fill="#a7f3d0" />
    </svg>
  );
};

export function EmptyState({
  kind = "tasks",
  title,
  text,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <div
      className={`text-center ${
        compact ? "py-6" : "bg-white rounded-2xl border border-dashed border-gray-300 p-10"
      }`}
    >
      <div className="flex justify-center mb-3">
        <Illustration kind={kind} size={compact ? 64 : 96} />
      </div>
      <p className="font-semibold text-gray-800">{title}</p>
      {text && <p className="text-sm text-gray-500 mt-1">{text}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
