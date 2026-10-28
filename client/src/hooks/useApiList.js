// src/hooks/useApiList.js
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

// Go can return null for an empty list; always hand the UI an array.
export const toArray = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];

// Turn an axios error into a message a user can act on.
export const errorMessage = (err, what = "data") => {
  if (!err?.response) return `Can't reach the server. Check your connection and try again.`;
  const status = err.response.status;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return `You don't have access to this ${what}.`;
  if (status >= 500) return `The server had a problem loading your ${what}. Please try again.`;
  return err.response.data?.error || `Couldn't load your ${what}.`;
};

/**
 * Fetch a list from the API with loading / error state.
 *
 *   const { data, setData, loading, error, retry, reload } =
 *     useApiList("/tasks/", "tasks", { what: "tasks" });
 *
 * - loading: true only for the first load and for retry() (shows a spinner)
 * - reload(): refetch quietly (after creating something, on a socket event)
 * - retry(): refetch and show the spinner again (wire to the Retry button)
 * - setData: for live updates from WebSockets
 */
export function useApiList(path, key, { enabled = true, what = key } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await api.get(path);
        setData(toArray(res.data, key));
      } catch (err) {
        console.error(`Failed to fetch ${what}:`, err);
        setError(errorMessage(err, what));
      } finally {
        setLoading(false);
      }
    },
    [path, key, what, enabled]
  );

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => load(), [load]);
  const reload = useCallback(() => load({ silent: true }), [load]);

  return { data, setData, loading, error, retry, reload };
}