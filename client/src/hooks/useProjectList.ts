import { useCallback, useEffect, useState } from "react";
import { getProjects } from "../api/projects";
import type { ProjectListItem } from "../types/project";

interface State {
  projects: ProjectListItem[];
  loading: boolean;
  error: string | null;
}

export function useProjectList() {
  const [state, setState] = useState<State>({
    projects: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { projects } = await getProjects();
      setState({ projects, loading: false, error: null });
    } catch (err) {
      setState({
        projects: [],
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load projects",
      });
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}