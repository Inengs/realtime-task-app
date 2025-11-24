# TaskFlow - Real-Time Task Management

A full-stack task management application with real-time updates.

## Tech Stack

**Backend:** Go, Gin, PostgreSQL, WebSocket  
**Frontend:** React, Vite, WebSocket Client

## Features

- Secure authentication with email verification
- Real-time task and project updates
- Complete CRUD operations with instant notifications
- Rate limiting, input sanitization, and session-based security

## Quick Start

**Backend:** `cd server && go run main.go` (requires PostgreSQL)  
**Frontend:** `cd client && npm install && npm run dev`  
Configure `.env` files in both directories before running.

See `/server/README.md` and `/client/taskapp/README.md` for detailed documentation.
