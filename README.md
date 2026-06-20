# 🌸 Daily Tracker

A girly, pastel, fully-functional **Personal Daily Tracker** — habits, study sessions, tasks, goals, analytics, calendar, Pomodoro timer, journal, notes, dark mode, CSV export, and JSON backups. Built with React + TypeScript + Tailwind on the frontend and Node + Express + Prisma + SQLite on the backend.

---

## ✨ Features

- **Auth** — register / login / logout with bcrypt password hashing + JWT
- **Habit Tracker** — create/edit/delete habits, daily check-off, streak + longest-streak tracking
- **Study Tracker** — log sessions by subject/topic/duration, daily/weekly/monthly stats, subject breakdown
- **Tasks** — priority (Low/Medium/High), status (Pending/In Progress/Completed), due dates
- **Goals** — short-term & long-term goals with progress bars
- **Analytics** — Chart.js visualizations: habit consistency, study trends, subject breakdown, productivity score
- **Calendar** — month grid with per-day activity (habits, study, tasks, goals)
- **Pomodoro Timer** — 25/5/15-minute focus & break cycles with a chime
- **Daily Journal** — mood + freeform entry per day
- **Notes** — sticky-note style freeform notes, pinnable, color-coded
- **Notifications** — computed reminders for pending habits, missed streaks, upcoming/overdue deadlines
- **Dark Mode** — toggle saved to the database per-user
- **Export** — CSV export per data type + full JSON backup

---

## 🗂 Project Structure

```
daily-tracker/
├── server/                  # Express + TypeScript + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma    # Full DB schema (User, Habit, StudySession, Task, Goal, ...)
│   │   └── seed.ts          # Demo data seeder
│   ├── src/
│   │   ├── routes/          # auth, habits, study, tasks, goals, dashboard, analytics,
│   │   │                      calendar, settings, notifications, journal, notes, export
│   │   ├── middleware/       # auth (JWT), validation, error handling
│   │   ├── utils/            # prisma client, jwt/date helpers
│   │   └── index.ts          # app entry point
│   ├── .env                  # already created for you (from .env.example)
│   └── package.json
├── client/                   # React + TypeScript + Tailwind SPA
│   ├── src/
│   │   ├── pages/            # one file per route/page
│   │   ├── components/       # Sidebar, Header, Layout, Modal, ProgressBar, etc.
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── api/               # axios client + typed endpoint functions
│   │   ├── types/             # shared TS interfaces
│   │   └── utils/             # date/format helpers, chart.js setup
│   └── package.json
└── package.json               # root orchestrator (runs both via concurrently)
```

---

## 🚀 Quick Start (run immediately)

> Requires **Node.js 18+** installed.

```bash
# from the project root (the "daily-tracker" folder)
npm install
npm run dev
```

That's it. `npm install` at the root automatically:
1. Installs root, `server`, and `client` dependencies
2. Runs `prisma generate` (builds the Prisma client)
3. Runs `prisma migrate dev` (creates `server/prisma/dev.db` SQLite file + tables)

`npm run dev` then starts **both** servers concurrently:
- Backend → `http://localhost:4000`
- Frontend → `http://localhost:5173` ← open this in your browser

The `.env` file in `server/` is already created with working defaults — no setup needed. (See **Environment Variables** below if you want to customize it.)

### Optional: seed demo data

To play with realistic sample data (5 habits, 14 study sessions, tasks, goals) under a demo account:

```bash
npm run seed
```

Then log in with:
- **Email:** `demo@dailytracker.app`
- **Password:** `password123`

Or just register your own new account from the app — registration works immediately.

---

## 🔧 Environment Variables

File: `server/.env` (already created from `server/.env.example`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-this-with-a-long-random-secret-string-for-security"
JWT_EXPIRES_IN="7d"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite file path (relative to `server/prisma/`) |
| `JWT_SECRET` | Secret used to sign JWTs — **change this** for any real deployment |
| `JWT_EXPIRES_IN` | How long login tokens stay valid |
| `PORT` | Backend port |
| `CLIENT_ORIGIN` | Allowed CORS origin (the Vite dev server) |

---

## 🗄 Database & Migrations

The schema lives in `server/prisma/schema.prisma` and covers:

`User → UserSettings (1:1)`, `User → Habit → HabitCompletion`, `User → StudySession`, `User → Task`, `User → Goal`, `User → JournalEntry`, `User → Note`.

Common commands (run from `server/`, or use the root shortcuts):

```bash
npm run prisma:generate   # regenerate the Prisma client after schema changes
npm run prisma:migrate    # create & apply a new migration
npm run prisma:studio     # open Prisma Studio — a GUI to browse/edit your data
npm run seed              # populate demo data
```

Root shortcuts (from the project root):
```bash
npm run db:generate
npm run db:migrate
npm run seed
```

To start completely fresh, delete `server/prisma/dev.db` and re-run `npm run db:migrate` (from root) or `npx prisma migrate dev` (from `server/`).

---

## 🧩 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Chart.js (`react-chartjs-2`), lucide-react icons |
| Backend | Node.js, Express, TypeScript, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator` |
| Database | SQLite via Prisma ORM |
| Dev tooling | `tsx` (hot reload), `concurrently` (run both servers with one command) |

---

## 📡 API Overview

All routes are prefixed with `/api`. Except `/api/auth/*` and `/api/health`, every route requires a `Authorization: Bearer <token>` header.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Habits | `GET/POST /habits`, `GET/PUT/DELETE /habits/:id`, `POST /habits/:id/toggle` |
| Study | `GET/POST /study`, `PUT/DELETE /study/:id`, `GET /study/stats` |
| Tasks | `GET/POST /tasks`, `PUT/DELETE /tasks/:id`, `PATCH /tasks/:id/complete` |
| Goals | `GET/POST /goals`, `PUT/DELETE /goals/:id` |
| Dashboard | `GET /dashboard` |
| Analytics | `GET /analytics/habits`, `GET /analytics/study`, `GET /analytics/productivity` |
| Calendar | `GET /calendar?month=YYYY-MM` |
| Settings | `GET/PUT /settings` |
| Notifications | `GET /notifications` |
| Journal | `GET/POST /journal`, `DELETE /journal/:id` |
| Notes | `GET/POST /notes`, `PUT/DELETE /notes/:id` |
| Export | `GET /export/csv?type=habits\|study\|tasks\|goals`, `GET /export/backup` |

All inputs are validated server-side with `express-validator`; errors return structured JSON (`{ error, details? }`) via a centralized error-handling middleware. Streak calculations, dashboard aggregates, and notifications are fully computed server-side from real data (no separate "fake" tables) so they're always accurate.

---

## 🎨 Design Notes

The aesthetic is intentionally **soft, pastel, Notion-cute**: blush pink + lavender gradients, rounded "pill" navigation, soft drop shadows, a custom heart-style checkbox, Quicksand/Poppins typography, and gentle motion (fade/slide/float animations). Dark mode swaps the palette to a deep plum background while keeping the same pink/lavender accents.

---

## 🛠 Troubleshooting

- **Prisma engine download fails / network error during `npm install`:** Prisma needs to download a small native query-engine binary the first time. Make sure your machine has normal internet access (no corporate proxy blocking `binaries.prisma.sh`). Re-run `npm install` once connectivity is restored.
- **Port already in use:** Change `PORT` in `server/.env` (backend) or pass `--port` to Vite (frontend), e.g. edit the `dev` script in `client/package.json`.
- **Reset your data:** Delete `server/prisma/dev.db` and run `npx prisma migrate dev` again from `server/`.
- **Forgot you're logged in as the demo user:** Just log out from the sidebar and register a fresh account.

Enjoy building beautiful habits! 🌸✨
