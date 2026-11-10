export interface DashboardStats{
    total: number;
    in_progress: number;
    completed: number;
    overdue: number;
    deltas: {
        total: number;
        in_progress: number;
        completed: number;
        overdue: number
    }
}

export interface TaskUserBrief {
  id: number;
  username: string;
  avatar_url: string;
}

export interface StatItem {
  id: "total" | "in-progress" | "completed" | "overdue";
  label: string;
  value: number;
  delta: number;       // percentage change vs last period
  trend: "up" | "down"; // direction of change
  icon: "list" | "loader" | "check-circle" | "alert-circle";
}

export interface DashboardTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  creator: TaskUserBrief;
  assignee: TaskUserBrief | null;
}