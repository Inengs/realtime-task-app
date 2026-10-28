// src/hooks/useAuth.js
// Thin wrapper over your AuthContext: same user/loading/login/logout,
// plus the derived values every page was rebuilding by hand.
import { useAuth as useAuthContext } from "../contexts/AuthContext";

export function useAuth() {
  const ctx = useAuthContext();
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");

  const { user } = ctx;
  const displayName = user?.username || user?.name || user?.full_name || "";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    ...ctx,
    userId: user?.user_id,
    isAuthenticated: Boolean(user?.user_id),
    displayName, // "" when unknown, so callers choose their own fallback
    initials,
  };
}