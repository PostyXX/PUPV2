# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PUPV2 is a pet healthcare platform (สุขภาพสัตว์เลี้ยง) built as a senior project at Bangkok University. It supports 3 roles: `user` (pet owner), `hospital`, and `admin`.

## Architecture

Monorepo with two separate packages:

```
/                   → Frontend (React + Vite)
/server/            → Backend (Express + TypeScript + Prisma)
/api/index.ts       → Vercel serverless entry point (imports from server/src/app)
```

**Frontend** calls backend API via `VITE_API_BASE_URL` env var. In production (Vercel one-project), this is empty string so calls are relative (same domain).

**Backend** is CommonJS (not ESM) — `"type": "module"` was removed from `server/package.json` to support Vercel serverless. All imports use no `.js` extensions.

## Development Commands

### Frontend
```bash
npm install
npm run dev          # Vite dev server on port 5173
npm run build        # Production build → dist/
```

### Backend
```bash
cd server
npm install
npm run dev          # tsx watch on port 4000
npm run build        # tsc → dist/
npm run start        # prisma migrate deploy && node dist/index.js
```

### Database
```bash
cd server
npx prisma migrate dev --name <name>   # Create + apply new migration
npx prisma migrate deploy              # Apply existing migrations (production)
npx prisma generate                    # Regenerate Prisma client after schema changes
npx prisma studio                      # Visual DB browser
```

## Environment Variables

### Frontend (`.env` at root — gitignored)
```
VITE_API_BASE_URL=http://127.0.0.1:4000   # local dev; empty for Vercel one-project
```

### Backend (`server/.env` — gitignored)
```
DATABASE_URL=postgresql://...    # Supabase PostgreSQL
PORT=4000
JWT_SECRET=...
FRONTEND_BASE_URL=...            # Used in password reset emails
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM
```

## Database (Prisma + Supabase PostgreSQL)

Schema at `server/prisma/schema.prisma`. Key models:
- **User** — roles: `user | hospital | admin`
- **Pet** — owned by User, image stored as `@db.Text` (base64)
- **Hospital** — type: `hospital | clinic`, has lat/lng
- **Appointment** — status: `pending | confirmed | completed | cancelled`
- **Vaccination, MedicalRecord, Notification, ActivityLog, UserSession**

When modifying schema, always run `prisma migrate dev` locally, then commit the generated migration file.

## API Routes (Express)

All routes in `server/src/routes/`. Mounted in `server/src/app.ts`:

| Path | File |
|------|------|
| `/auth` | auth.ts |
| `/users` | users.ts |
| `/pets` | pets.ts |
| `/hospitals` | hospitals.ts |
| `/appointments` | appointments.ts |
| `/vaccinations` | vaccinations.ts |
| `/medical-records` | records.ts |
| `/activity-logs` | activityLogs.ts |
| `/notifications` | notifications.ts |
| `/user-activity` | user-activity.ts |

Auth middleware at `server/src/middleware/auth.ts` — validates JWT from `Authorization: Bearer <token>`. Use `requireAuth(roles?)` to protect routes.

## Deployment (Vercel + Supabase)

One Vercel project serves both frontend and backend:
- Vite builds frontend → served as static files
- `/api/index.ts` → Express app as Vercel serverless function
- `vercel.json` at root routes API paths to `/api/index.ts`, rest to static

**Vercel build command:**
```
npm install && npm run build && cd server && npm install && npx prisma generate && npx prisma migrate deploy
```

**Required Vercel env vars:** `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`

## Frontend Structure

- `src/App.tsx` — all routes with `RequireRole` guards
- `src/pages/` — one file per page
- `src/components/` — shadcn/ui components + custom
- `src/i18n/` — Thai (`th.ts`) and English (`en.ts`) translations, stored in localStorage as `pup_lang`
- Auth state stored in localStorage: `pup_token` (JWT), role, userId
