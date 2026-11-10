import { useEffect, useState } from "react";
import { type DashboardTrendPoint } from "../types/dashboard"
import { getDashboardTrend } from "../api/dashboard";

interface State {
  trend: DashboardTrendPoint[];
  loading: boolean;
  error: string | null;
}

export function useDashboardTrend(days: number = 14) {
  const [state, setState] = useState<State>({
    trend: [],
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { trend } = await getDashboardTrend(days);
      setState({ trend, loading: false, error: null });
    } catch (err: any) {
      setState({ trend: [], loading: false, error: err.message });
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return { ...state, refetch };
}