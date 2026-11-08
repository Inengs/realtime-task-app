// api/dashboard.ts
// Talks to the Go backend's /dashboard endpoints.
// All functions attach the session cookie automatically (via `credentials: "include"`).

import api from "../axios/api"
import type {
    DashboardStats,
    TaskUserBrief
} from "../types/dashboard"

export async function getDashboardStats(): Promise<{ message: string; stats: DashboardStats }> {
    const {data} = await api.get("/dashboard/stats")
    return data
}
