// src/hooks/useTasks.js
import { useMemo } from "react";
import { useApiList } from "./useApiList";
import { useLiveSync } from "./useLiveSync";
import { useCrud } from "./useCrud";

// Status values as stored in the database
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

// Shared by Dashboard and the Tasks page (it was duplicated in both)
export const filterTasks = (tasks, { status = "All", query = "" } = {}) => {
  const q = query.toLowerCase();
  return tasks
    .filter((t) => status === "All" || t.status === status)
    .filter((t) => (t.title ?? "").toLowerCase().includes(q));
};

export const taskStats = (tasks) => {
  const count = (s) => tasks.filter((t) => t.status === s).length;
  const done = count(TASK_STATUS.DONE);
  return {
    total: tasks.length,
    done,
    inProgress: count(TASK_STATUS.IN_PROGRESS),
    pending: count(TASK_STATUS.PENDING),
    completionRate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
};

/**
 * const { tasks, stats, loading, error, retry, reload, createTask, updateTask, deleteTask } =
 *   useTasks({ enabled: isAuthenticated, live: true, projectId });
 */
export function useTasks({ enabled = true, live = false, projectId } = {}) {
  const { data, setData, loading, error, retry, reload } = useApiList("/tasks/", "tasks", {
    enabled,
  });

  useLiveSync({ path: "/ws/tasks/", prefix: "task", setData, enabled: enabled && live });

  const tasks = useMemo(
    () => (projectId == null ? data : data.filter((t) => t.project_id === projectId)),
    [data, projectId]
  );
  const stats = useMemo(() => taskStats(tasks), [tasks]);

  const { create, update, remove } = useCrud("/tasks/", { data, setData, reload });

  return {
    tasks,
    stats,
    loading,
    error,
    retry,
    reload,
    setTasks: setData,
    createTask: create,
    updateTask: update,
    deleteTask: remove,
  };
}