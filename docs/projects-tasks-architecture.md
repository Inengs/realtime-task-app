# Projects & Tasks: Architecture

## 1. Domain model

```
user ──< project_members >── project ──< task
              (role)                      │
                                          └─ creator (user_id), assignee (assignee_id)
```

- A **project** has many members. A **task** belongs to exactly one project.
- Access to a task is decided by the user's membership of its project, not by `tasks.user_id`.
- Statuses: `todo`, `in-progress`, `in-review`, `done` (existing values kept; `in-review` is new).
- Keep the single `assignee_id` for now. Multiple assignees (`task_assignees`) can come later.

### Schema changes (via `db.RunMigrations`)

| Change | Notes |
|---|---|
| `project_members(project_id, user_id, role, joined_at)` | PK `(project_id, user_id)`. Role is `owner`, `admin` or `member`. |
| Backfill | Insert every existing project's creator as `owner`. |
| `tasks.position` (int) | Order within a status column. Index `(project_id, status, position)`. |
| `tasks.project_id` | Already exists. Make it required later. |

## 2. Authorization (one place only)

A single helper, `requireProjectRole(db, projectID, userID, minRole)`, is called by every project and task handler.

- Not a member returns **404**, not 403, so project existence isn't leaked.
- Member but too low a role returns 403.

| Action | Minimum role |
|---|---|
| View project and tasks, create/edit/move tasks | member |
| Rename project, invite/remove members | admin |
| Delete project, change roles | owner |

## 3. Endpoints

Build in this order. Each row is one backend slice followed by one frontend slice.

### Projects (routes already exist; extend them)
| # | Method and path | Purpose |
|---|---|---|
| 1 | `GET /projects/` | Projects I'm a member of, with `role`, `task_count`, `done_count`, `member_count` and up to 4 member briefs |
| 2 | `POST /projects/` | Create a project; the creator becomes `owner` |
| 3 | `GET /projects/:id` | One project's details plus my role |
| 4 | `PUT /projects/:id` | Rename or edit (admin or above) |
| 5 | `DELETE /projects/:id` | Owner only |

### Tasks (project-scoped)
| # | Method and path | Purpose |
|---|---|---|
| 6 | `GET /projects/:id/tasks` | All tasks for the board, list and calendar. Filters: `status`, `assignee`, `priority`, `q` |
| 7 | `POST /projects/:id/tasks` | Create a task in this project |
| 8 | `PUT /tasks/:id` | Edit a task (existing handler; switch its auth to membership) |
| 9 | `PATCH /tasks/:id/status` | Move between columns; add `position` (existing handler) |
| 10 | `DELETE /tasks/:id` | Delete (existing handler) |

### Members
| # | Method and path | Purpose |
|---|---|---|
| 11 | `GET /projects/:id/members` | Member list |
| 12 | `POST /projects/:id/members` | Invite by email (user must already exist for now) |
| 13 | `PATCH /projects/:id/members/:userId` | Change role |
| 14 | `DELETE /projects/:id/members/:userId` | Remove, or leave |

### Later
`GET /tasks/mine` (My Tasks) · subtasks (`/tasks/:id/subtasks`) · comments · pending invitations for emails that don't have an account yet.

## 4. Backend layout (existing pattern)

```
server/
  routes/projectsRoutes.go     group "/projects" + AuthMiddleware (exists)
  routes/taskRoutes.go         add GET/POST /projects/:id/tasks here or in projectsRoutes
  controllers/projectController.go   handlers, slog logging, c.Get("user_id")
  controllers/memberController.go    new
  models/project.go            ProjectListItem, ProjectDetail, ProjectMember
  models/task.go               reuse TaskUserBrief for creator/assignee/members
  utils/projectAccess.go       requireProjectRole
```

Conventions to keep:
- `db := c.MustGet("db").(*sql.DB)`, and `uid` from `c.Get("user_id")` with the int assertion.
- `slog` messages for warn, error and info.
- Response envelope: `gin.H{"message": "...", "projects": [...]}`.
- Return `[]`, not `null`, for empty lists.
- Existing routes use trailing slashes (`/projects/`), so the client must call them exactly that way.

## 5. Frontend layout (dashboard pattern)

```
client/src/
  types/project.ts, task.ts
  hooks/useProjects.ts          { projects, loading, error, refetch }
  hooks/useProject.ts
  hooks/useProjectTasks.ts      fetch + WebSocket room updates
  hooks/useProjectMembers.ts
  contexts/ProjectsContext.tsx  shared list: sidebar and ProjectsPage use one fetch
  pages/project-management/     ProjectsPage (exists)
    components/ProjectCard.tsx, NewProjectModal.tsx, Skeleton
  pages/project/                ProjectPage at /projects/:projectId
    components/ProjectHeader, ViewTabs, Toolbar, KanbanBoard,
               KanbanColumn, TaskCard, ListView, InviteModal
  components/sidebar/ProjectsNav.tsx   collapsible project list
```

Conventions to keep:
- Hooks return `{ data, loading, error, refetch }`.
- The page shows the skeleton while loading and the error state with Retry on failure, as in `DashboardPage`.
- API data is adapted to the UI shape inside the page, not inside components.
- Add the route `/projects/:projectId` under `AppLayout`.
- Rename the `/tasks` sidebar item to "My Tasks" later, and point `New Task` at a project picker.

## 6. Realtime

- Rooms change from per-user to per-project: `{channel, projectID}`.
- Join is allowed only when `requireProjectRole` passes.
- Events: `task_created`, `task_updated`, `task_deleted`, `project_updated`, `member_added`.
- WebSocket auth is still unresolved (browsers can't send an `Authorization` header). Settle it before this step.

## 7. Known gaps to close

1. The dashboard queries filter by `t.user_id = $1`. Switch them to project membership, or shared tasks won't show there.
2. Resolve the post-login 401 logout loop (cookie vs. JWT).
3. Decide whether `tasks.user_id` stays as "creator" only (recommended).

## 8. Build order

0. Migration plus `requireProjectRole`.
1. `GET /projects/` → `useProjects` → `ProjectsPage` + sidebar list.
2. `POST /projects/` → `NewProjectModal`.
3. `GET /projects/:id` and `GET /projects/:id/tasks` → `ProjectPage` with a static board.
4. Task create, edit and status endpoints → drag and drop.
5. Members and invites.
6. Project WebSocket rooms.
7. List and Calendar views.