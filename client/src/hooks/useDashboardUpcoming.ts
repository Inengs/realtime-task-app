import { useEffect, useState } from "react";
import { getDashboardUpcoming} from "../api/dashboard";
import type { UpcomingTask } from "../types/dashboard";

interface State {
  tasks: UpcomingTask[];
  loading: boolean;
  error: string | null;
}

export function useDashboardUpcoming(days = 7) {
  const [state, setState] = useState<State>({ tasks: [], loading: true, error: null });

  const refetch = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { tasks } = await getDashboardUpcoming(days);
      setState({ tasks, loading: false, error: null });
    } catch (err: any) {
      setState({ tasks: [], loading: false, error: err.message });
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return { ...state, refetch };
}