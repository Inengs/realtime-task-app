// src/hooks/useProjects.js
import { useMemo } from "react";
import { useApiList } from "./useApiList";
import { useLiveSync } from "./useLiveSync";
import { useCrud } from "./useCrud";

// Tolerate different field names until the API shape is confirmed
export const projectId = (p) => p.id ?? p.project_id;
export const projectName = (p) => p.name ?? p.title ?? p.project_name ?? "Untitled project";

// Adds { progress: { total, done, pct } } to each project
export const withProgress = (projects, tasks) =>
  projects.map((p) => {
    const mine = tasks.filter((t) => t.project_id === projectId(p));
    const done = mine.filter((t) => t.status === "done").length;
    return {
      ...p,
      progress: {
        total: mine.length,
        done,
        pct: mine.length ? Math.round((done / mine.length) * 100) : 0,
      },
    };
  });

/**
 * const { projects, loading, error, retry, createProject } =
 *   useProjects({ enabled: isAuthenticated, live: true, tasks });   // tasks optional -> adds .progress
 */
export function useProjects({ enabled = true, live = false, tasks } = {}) {
  const { data, setData, loading, error, retry, reload } = useApiList("/projects/", "projects", {
    enabled,
  });

  useLiveSync({
    path: "/ws/projects/",
    prefix: "project",
    setData,
    enabled: enabled && live,
    idOf: projectId,
  });

  const projects = useMemo(() => (tasks ? withProgress(data, tasks) : data), [data, tasks]);

  const { create, update, remove } = useCrud("/projects/", {
    data,
    setData,
    reload,
    idOf: projectId,
  });

  return {
    projects,
    loading,
    error,
    retry,
    reload,
    setProjects: setData,
    createProject: create,
    updateProject: update,
    deleteProject: remove,
  };
}