import { useEffect, useState } from "react";
import { getDashboardProgress } from "../api/dashboard";
import type { DashboardProgress } from "../types/dashboard";

interface State {
  progress: DashboardProgress | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardProgress() {
  const [state, setState] = useState<State>({
    progress: null,
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { progress } = await getDashboardProgress();
      setState({ progress, loading: false, error: null });
    } catch (err: any) {
      setState({ progress: null, loading: false, error: err.message });
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { ...state, refetch };
}