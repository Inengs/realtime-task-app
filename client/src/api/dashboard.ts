// api/dashboard.ts
// Talks to the Go backend's /dashboard endpoints.
// All functions attach the session cookie automatically (via `credentials: "include"`).

import api from "../axios/api"
import type {
    DashboardStats,
    TaskUserBrief,
    DashboardTask,
    DashboardProgress,
    DashboardTrendPoint,
    UpcomingTask,
    DashboardActivityItem
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

export async function getDashboardTrend(days = 14): Promise<{ message: string; trend: DashboardTrendPoint[] }> {
  const { data } = await api.get(`/dashboard/trend?days=${days}`);
  return data;
}

export async function getDashboardUpcoming(days = 7): Promise<{ message: string; tasks: UpcomingTask[] }> {
  const { data } = await api.get(`/dashboard/upcoming?days=${days}`);
  return data;
}

export async function getDashboardActivity(limit = 5): Promise<{ message: string; activity: DashboardActivityItem[] }> {
  const { data } = await api.get(`/dashboard/activity?limit=${limit}`);
  return data;
}