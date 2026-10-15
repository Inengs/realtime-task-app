# TaskFlow — Real-Time Task Management App

A full-stack, real-time task management application. Users register securely, organize work into projects and tasks, and see updates (creates, edits, status changes, notifications) pushed live across sessions via WebSockets. No refresh needed.

- **Live app:** https://taskflow.inengiyeemmanuel.site
- **API:** https://taskflow-api.inengiyeemmanuel.site
- **Author:** Inengiye Emmanuel

<!-- Add 2–3 screenshots here: dashboard, notifications, mobile view -->

## Features

| Area | Details |
|------|---------|
| 🔐 Auth | Registration and login with bcrypt-hashed passwords, HTTP-only cookie sessions, email verification (24h token expiry), resend verification, per-IP rate limiting on auth routes |
| 📁 Projects | Full CRUD, per-user ownership, cascading delete of contained tasks |
| ✅ Tasks | Full CRUD, status workflow (pending → in-progress → done), optional project assignment, status-only PATCH endpoint, client-side filtering and search |
| 🔔 Notifications | Auto-generated on task/project events, unread badge counts, mark-as-read (single or all) |
| ⚡ Real-time | Three WebSocket channels (`/ws/tasks`, `/ws/projects`, `/ws/notifications`) push `{type, data}` events to every session a user has open |
| 📊 Dashboard | Combined project and task view with live filters and search |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router, TanStack Query, react-icons |
| Backend | Go 1.23, Gin |
| Real-time | Gorilla WebSocket |
| Database | PostgreSQL 16 |
| Auth | Gorilla SecureCookie sessions, bcrypt |
| Email | SMTP with HTML templates |
| Containers | Docker (multi-stage builds), Docker Compose |
| Deployment | AWS EC2 (Ubuntu), Caddy reverse proxy with automatic HTTPS (Let's Encrypt) |

**Why this stack:** Go's lightweight goroutines make the per-user WebSocket connection manager cheap to run; a static compiled binary keeps the production image at ~15MB; sessions use HttpOnly cookies instead of localStorage JWTs to reduce XSS token-theft risk.

## Architecture

```
                    ┌──────────────────────── EC2 (Ubuntu, Docker) ────────────────────────┐
Browser ──HTTPS──►  │  Caddy (:80/:443) — TLS, auto-cert, routing by hostname               │
        ──WSS────►  │    ├── taskflow.<domain>     → web (nginx serving React build)        │
                    │    ├── taskflow-api.<domain> → api (Go binary :8080)                  │
                    │                                                                       │
                    │  api ──► db (PostgreSQL 16, named volume for persistence)             │
                    └───────────────────────────────────────────────────────────────────────┘
```

- Caddy is the single entry point. Only it publishes ports; `db`, `api`, and `web` are unreachable from the internet.
- TLS certificates are issued and renewed automatically by Caddy (Let's Encrypt).
- The database persists across deploys via a Docker volume.
- All secrets are injected via environment variables. Nothing sensitive lives in images or git.

## Getting Started (Local Development)

### Prerequisites

- Docker and Docker Compose
- Go 1.23+ and Node 20+ (only if developing outside Docker)

### 1. Clone and configure

```bash
git clone https://github.com/Inengs/realtime-task-app.git
cd realtime-task-app
cp server/.env.example server/.env   # then edit values
```

`server/.env` (local dev):

```env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=taskapp
DB_SSLMODE=disable
SESSION_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:3000
APP_BASE_URL=http://localhost:3000
APP_ENV=development

# SMTP for verification emails — Mailtrap works well for local dev
EMAIL_FROM=test@example.com
EMAIL_USERNAME=...
EMAIL_PASSWORD=...
EMAIL_SMTP_HOST=sandbox.smtp.mailtrap.io
EMAIL_SMTP_PORT=587
```

### 2. Start the stack

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- API → http://localhost:8080
- The Postgres schema (users, projects, tasks, notifications) auto-migrates on API startup.

### 3. Try it

Register an account, grab the verification link from your Mailtrap inbox, verify, log in, then create projects and tasks. Open a second browser window logged in as the same user and watch edits appear in real time.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account (rate-limited) |
| GET | `/auth/verify-email?token=` | Verify email |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/login`, `/auth/logout` | Session lifecycle |
| GET | `/auth/me` | Current user from session |
| GET/POST | `/projects` | List / create projects |
| GET/PUT/DELETE | `/projects/:id` | Project detail (owner-scoped) |
| GET/POST | `/tasks` | List / create tasks |
| GET/PUT/DELETE | `/tasks/:id` | Task detail (owner-scoped) |
| PATCH | `/tasks/:id/status` | Update only the status |
| GET | `/notifications/:id` | List notifications |
| PATCH | `/notifications/read/:id` | Mark read (IDs or all) |
| GET | `/ws/tasks`, `/ws/projects`, `/ws/notifications` | WebSocket channels (auth required) |

All data endpoints authorize against the session's `user_id` server-side.

## Deployment

Production runs on a single AWS EC2 instance with everything containerized:

- Swap enabled on the micro instance (1GB RAM needs headroom for frontend builds)
- DNS: two A records (`taskflow`, `taskflow-api`) pointing to the instance IP
- `docker-compose.prod.yml`: `db`, `api`, `web`, and `caddy` services, with only Caddy exposed on 80/443
- `Caddyfile`: two hostname blocks reverse-proxying to `web` and `api`
- Deploy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Planned: GitHub Actions CI/CD (test → build → SSH deploy) and CloudWatch alarms.

## Security Notes

- bcrypt password hashing; identical responses for wrong email vs wrong password (no user enumeration)
- Input sanitization (control-character stripping, username charset whitelist, email normalization) plus validator tags on all inputs
- Server-side authorization on every query, so IDs from URLs can't be used to access other users' data
- Per-IP token-bucket rate limiting on registration, login, and resend endpoints
- HttpOnly / SameSite / Secure cookies in production; `.env` files git-ignored

## Roadmap

- [ ] Team workspaces and task assignment
- [ ] Task due dates with scheduled email reminders
- [ ] GitHub Actions CI/CD pipeline
- [ ] CloudWatch monitoring and alerting
- [ ] Multi-instance WebSocket fan-out via Redis pub/sub