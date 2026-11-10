import { useEffect, useState } from "react";
import { type DashboardTask } from "../types/dashboard";
import { getDashboardRecentTasks } from "../api/dashboard";


interface State {
  tasks: DashboardTask[];
  loading: boolean;
  error: string | null;
}

export function useDashboardRecentTasks() {
  const [state, setState] = useState<State>({
    tasks: [],
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { tasks } = await getDashboardRecentTasks();
      setState({ tasks, loading: false, error: null });
    } catch (err: any) {
      setState({ tasks: [], loading: false, error: err.message });
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { ...state, refetch };
}