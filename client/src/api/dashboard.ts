// api/dashboard.ts
// Talks to the Go backend's /dashboard endpoints.
// All functions attach the session cookie automatically (via `credentials: "include"`).

import api from "../axios/api"
import type {
    DashboardStats,
    TaskUserBrief,
    DashboardTask,
    DashboardProgress,
} from "../types/dashboard"

export async function getDashboardStats(): Promise<{ message: string; stats: DashboardStats }> {
    const {data} = await api.get("/dashboard/stats")
    return data
}

export async function getDashboardRecentTasks(): Promise<{ message: string; tasks: DashboardTask[] }> {
  const { data } = await api.get("/dashboard/recent-tasks");
  return data;
}

export async function getDashboardProgress(): Promise<{ message: string; progress: DashboardProgress }> {
  const { data } = await api.get("/dashboard/progress");
  return data;
}
