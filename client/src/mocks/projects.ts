import { ProjectListItem } from "../types/project";

// Mock data shaped exactly like GET /projects/. Includes edge cases:
// an empty project, a long name, and more members than avatars shown.
export const projects: ProjectListItem[] = [
  {
    id: 1,
    name: "Product Launch 2026",
    description: "Monitor all of your tasks here.",
    role: "owner",
    task_count: 12,
    done_count: 6,
    member_count: 7,
    members: [
      { id: 1, username: "emmanuel", avatar_url: "" },
      { id: 2, username: "Ada", avatar_url: "" },
      { id: 3, username: "Tunde", avatar_url: "" },
      { id: 4, username: "Chioma", avatar_url: "" },
    ],
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-11-12T17:55:00Z",
  },
  {
    id: 2,
    name: "Q3 Roadmap",
    description: "Planning and tracking for the third quarter.",
    role: "member",
    task_count: 8,
    done_count: 8,
    member_count: 2,
    members: [
      { id: 1, username: "emmanuel", avatar_url: "" },
      { id: 2, username: "Ada", avatar_url: "" },
    ],
    created_at: "2026-07-01T09:00:00Z",
    updated_at: "2026-10-20T10:00:00Z",
  },
  {
    id: 3,
    name: "Marketing Campaign for the Holiday Season and Beyond",
    description: "",
    role: "admin",
    task_count: 0,
    done_count: 0,
    member_count: 1,
    members: [{ id: 1, username: "emmanuel", avatar_url: "" }],
    created_at: "2026-11-10T09:00:00Z",
    updated_at: "2026-11-10T09:00:00Z",
  },
];