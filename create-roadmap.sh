#!/usr/bin/env bash
# Creates roadmap milestones, labels and 24 feature issues. Run ONCE.
#   gh auth login
#   bash create-roadmap.sh
set -euo pipefail

REPO="Inengs/realtime-task-app"

# Retry flaky network calls (3 attempts)
retry() { local n=0; until "$@"; do n=$((n+1)); [ $n -ge 3 ] && return 1; echo "retrying ($n)..."; sleep 3; done; }

mk_label() { retry gh label create "$1" --color "$2" --description "$3" --repo "$REPO" --force >/dev/null; }
mk_label feature      a2eeef "New feature"
mk_label roadmap      0052cc "Part of the product roadmap"
mk_label ai           c5def5 "AI-powered"
mk_label team         bfd4f2 "Collaboration / multi-user"
mk_label platform     d4c5f9 "Mobile, integrations, ecosystem"
mk_label polish       fef2c0 "UX polish"
mk_label backend      1d76db "Go API"
mk_label frontend     5319e7 "React UI"

# Milestones (skip if one with the same title exists)
mk_ms() {
  local title="$1" desc="$2"
  if retry gh api "repos/$REPO/milestones?state=all&per_page=100" --jq '.[].title' | grep -qxF "$title"; then
    echo "milestone exists: $title"
  else
    retry gh api "repos/$REPO/milestones" -f title="$title" -f description="$desc" >/dev/null
    echo "milestone created: $title"
  fi
}
M1="R1 - Quick wins"
M2="R2 - Retention"
M3="R3 - Differentiators"
M4="R4 - Teams"
M5="R5 - Platform"
M6="R6 - Polish"
mk_ms "$M1" "High-impact, low-effort: capture and focus"
mk_ms "$M2" "Features that bring users back"
mk_ms "$M3" "What makes TaskFlow stand out"
mk_ms "$M4" "Collaboration and network effects"
mk_ms "$M5" "Mobile and integrations"
mk_ms "$M6" "Delight and personalisation"

# Existing issue titles, so a rerun never creates duplicates
EXISTING="$(retry gh issue list --repo "$REPO" --state all --limit 500 --json title --jq '.[].title')"

feat() { # title, milestone, labels, body
  if printf '%s\n' "$EXISTING" | grep -qxF "$1"; then echo "skip (exists): $1"; return; fi
  retry gh issue create --repo "$REPO" --title "$1" --milestone "$2" --label "$3" --body "$4"
  sleep 1
}

# ---------------- R1: Quick wins ----------------
feat "Natural-language task creation" "$M1" "feature,roadmap,backend,frontend" \
"Type \`Meeting with Sarah tomorrow at 3pm #work\` and get a task with date, time and tag.

**Why:** frictionless capture.

- [ ] Backend: parse dates/times (e.g. \`github.com/olebedev/when\`) and \`#tags\`
- [ ] Endpoint or client-side parse that returns a task preview
- [ ] Frontend: smart input bar at the top of the dashboard
- [ ] Tests for common phrases and time zones"

feat "Keyboard shortcuts and Cmd+K quick add" "$M1" "feature,roadmap,frontend" \
"**Why:** power users live on the keyboard.

- [ ] Global Cmd/Ctrl+K opens a quick-add palette
- [ ] Enter saves; Esc closes
- [ ] Shortcut cheat-sheet (\`?\`)"

feat "Drag-and-drop Kanban board" "$M1" "feature,roadmap,frontend" \
"Columns: \`pending\`, \`in-progress\`, \`done\`.

- [ ] Board view using \`@hello-pangea/dnd\`
- [ ] Dropping a card updates status via the API
- [ ] Real-time sync of moves over the existing WebSocket"

feat "Today / Upcoming / Someday / Completed views" "$M1" "feature,roadmap,frontend,backend" \
"**Why:** less overwhelm; default landing page is today's tasks.

- [ ] API filters by due date range
- [ ] Sidebar tabs: Today, Next 7 days, Someday, Completed
- [ ] Today is the default landing view"

# ---------------- R2: Retention ----------------
feat "Recurring tasks" "$M2" "feature,roadmap,backend,frontend" \
"e.g. every Monday, every 2 weeks, the 1st of each month.

- [ ] Data model for recurrence rules (RRULE-style)
- [ ] Job that creates the next instance when one is completed
- [ ] UI to set and edit the rule"

feat "Smart notifications and digest emails" "$M2" "feature,roadmap,backend" \
"- [ ] Daily 8am email: what's due today
- [ ] Weekly Sunday email: plan your week
- [ ] WebSocket notification when a teammate assigns you a task
- [ ] Per-user notification settings and unsubscribe link
- [ ] Scheduler (cron/worker) that respects user time zones"

feat "Subtasks and checklists" "$M2" "feature,roadmap,backend,frontend" \
"- [ ] \`parent_task_id\` (or a subtasks table)
- [ ] Progress indicator on the parent
- [ ] UI to add, reorder and complete sub-items"

feat "Tags and smart filters" "$M2" "feature,roadmap,backend,frontend" \
"Tag tasks \`#work\`, \`#personal\`; filter with \`tag:work AND due:tomorrow\`.

- [ ] Tags table and many-to-many with tasks
- [ ] Filter query parser
- [ ] Saved filters"

# ---------------- R3: Differentiators ----------------
feat "AI task breakdown" "$M3" "feature,roadmap,ai,backend,frontend" \
"\"Launch podcast\" becomes a list of editable subtasks.

- [ ] \`POST /tasks/ai-breakdown\` calling an LLM API with a structured prompt
- [ ] Return subtasks for the user to edit before saving
- [ ] Rate limit and cost cap per user
- [ ] Never log prompts containing user data without consent"

feat "Focus mode and Pomodoro timer" "$M3" "feature,roadmap,frontend" \
"- [ ] Start a 25-minute session from a task
- [ ] Tab title shows the countdown
- [ ] Mute in-app notifications during a session
- [ ] Record completed sessions"

feat "Time tracking and reports" "$M3" "feature,roadmap,backend,frontend" \
"- [ ] \`task_sessions\` table: task_id, user_id, started_at, ended_at, duration_seconds
- [ ] Start/stop timer on a task (only one running timer per user)
- [ ] Reports: time per project and per day"

feat "Two-way Google Calendar sync" "$M3" "feature,roadmap,backend" \
"- [ ] OAuth with minimal scopes
- [ ] Tasks with due dates appear as events
- [ ] Rescheduling in either place updates the other
- [ ] Handle token refresh and revocation"

# ---------------- R4: Teams ----------------
feat "Real-time collaboration and presence" "$M4" "feature,roadmap,team,backend,frontend" \
"Builds on the existing WebSockets.

- [ ] Show who is viewing a task
- [ ] Conflict handling for simultaneous edits
- [ ] Live updates for field changes"

feat "Comments and activity feed" "$M4" "feature,roadmap,team,backend,frontend" \
"- [ ] Comment thread per task
- [ ] Project activity feed (\"Sarah moved 'API polish' to Done\")
- [ ] Mentions trigger notifications"

feat "Team workload view" "$M4" "feature,roadmap,team,frontend,backend" \
"- [ ] Tasks per member per week against a capacity setting
- [ ] Warn when assigning to an overloaded member"

feat "Public, read-only shareable project boards" "$M4" "feature,roadmap,team,backend,frontend" \
"- [ ] Unguessable share token per project, revocable
- [ ] Read-only page with no login
- [ ] Choose what is visible (hide comments, assignees)"

# ---------------- R5: Platform ----------------
feat "PWA: offline mode, push notifications, install prompt" "$M5" "feature,roadmap,platform,frontend" \
"- [ ] Service worker with a safe update strategy (no stale bundles after deploys)
- [ ] Offline read and queued writes
- [ ] Web push notifications
- [ ] Install prompt and valid manifest icons"

feat "Browser extension for quick capture" "$M5" "feature,roadmap,platform" \
"- [ ] Right-click: Add to TaskFlow
- [ ] Capture page URL, title and selected text
- [ ] Auth via API token"

feat "Slack / Discord / Telegram bot" "$M5" "feature,roadmap,platform,backend" \
"- [ ] \`/task add Buy milk\` creates a task
- [ ] Reminders sent to DMs
- [ ] Link chat account to TaskFlow user"

feat "Email-in tasks" "$M5" "feature,roadmap,platform,backend" \
"Each user gets a private address; forwarded emails become tasks.

- [ ] Inbound email handling (provider webhook or SES)
- [ ] Unguessable per-user address
- [ ] Attachments with size and type limits
- [ ] Spam and abuse protection"

# ---------------- R6: Polish ----------------
feat "Dark mode" "$M6" "feature,roadmap,polish,frontend" \
"- [ ] Follow system preference, with a manual toggle
- [ ] Persist the choice"

feat "Themes and accent colours" "$M6" "feature,roadmap,polish,frontend" \
"- [ ] Six accent colour themes (emerald is the default)
- [ ] Stored per user"

feat "Empty states with personality" "$M6" "feature,roadmap,polish,frontend" \
"- [ ] Friendly copy and a clear call to action for empty tasks, projects and notifications"

feat "Onboarding flow with a sample project" "$M6" "feature,roadmap,polish,backend,frontend" \
"- [ ] On first sign-up, create a \"Welcome to TaskFlow\" project with 5 sample tasks that teach the features
- [ ] Option to dismiss or delete the sample project"

echo "Done."