import { useEffect, useState } from "react";
import { getDashboardActivity} from "../api/dashboard";
import type { DashboardActivityItem } from "../types/dashboard";

interface State {
  activities: DashboardActivityItem[];
  loading: boolean;
  error: string | null;
}

export function useDashboardActivity(limit = 5) {
  const [state, setState] = useState<State>({
    activities: [],
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { activity } = await getDashboardActivity(limit);
      setState({ activities: activity, loading: false, error: null });
    } catch (err: any) {
      setState({ activities: [], loading: false, error: err.message });
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { ...state, refetch };
}