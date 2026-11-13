import { TaskUserBrief } from "./dashboard";
export type ProjectRole = "owner" | "admin" | "member";

// One card on the Projects page (GET /projects/).
export interface ProjectListItem {
  id: number;
  name: string;
  description: string;
  role: ProjectRole; // my role in this project
  task_count: number;
  done_count: number;
  member_count: number;
  members: TaskUserBrief[]; // first 4, for the avatar stack
  created_at: string;
  updated_at: string;
}