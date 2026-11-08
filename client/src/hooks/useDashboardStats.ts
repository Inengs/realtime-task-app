import { getDashboardStats } from "../api/dashboard";
import { useState, useEffect } from "react"
import { DashboardStats } from "../types/dashboard";

interface State{
    stats: DashboardStats | null
    loading: boolean
    error: string | null
}

export function useDashboardStats() {
    const [state, setState] = useState<State>({
        stats: null,
        loading: true,
        error: null,
    });

    const refetch = async () => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
        const { stats } = await getDashboardStats();
        setState({ stats, loading: false, error: null });
        } catch (err: any) {
        setState({ stats: null, loading: false, error: err.message });
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { ...state, refetch };
}