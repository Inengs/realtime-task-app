import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getProject } from "../api/projects";
import type { ProjectDetail } from "../types/project";

interface State {
  project: ProjectDetail | null;
  loading: boolean;
  error: string | null;
  notFound: boolean; // 404: missing, or I'm not a member
}

export function useProject(projectId: number) {
  const [state, setState] = useState<State>({
    project: null,
    loading: true,
    error: null,
    notFound: false,
  });
  // Ignore responses from an older request (e.g. after switching projects quickly).
  const latest = useRef(0);

  const refetch = useCallback(async () => {
    if (!Number.isInteger(projectId)) {
      setState({ project: null, loading: false, error: null, notFound: true });
      return;
    }
    const requestId = ++latest.current;
    setState((s) => ({ ...s, loading: true, error: null, notFound: false }));
    try {
      const { project } = await getProject(projectId);
      if (requestId !== latest.current) return;
      setState({ project, loading: false, error: null, notFound: false });
    } catch (err) {
      if (requestId !== latest.current) return;
      const notFound = axios.isAxiosError(err) && err.response?.status === 404;
      setState({
        project: null,
        loading: false,
        notFound,
        error: notFound ? null : err instanceof Error ? err.message : "Failed to load project",
      });
    }
  }, [projectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}