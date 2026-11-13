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

// The raw project row returned by POST /projects/.
export interface Project {
  id: number;
  name: string;
  description: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  name: string;
  description: string;
}

// GET /projects/:id: header data for the board page.
export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  role: ProjectRole;
  member_count: number;
  members: TaskUserBrief[]; // first 8
  created_at: string;
  updated_at: string;
}