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