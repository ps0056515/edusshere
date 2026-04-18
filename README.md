# EduSphere portal

Next.js app with a public marketing home, **Google SSO**, **email OTP** sign-in (codes are **logged in the dev server terminal** until you plug in email delivery), and a protected **`/portal`** area. Data lives in **PostgreSQL** via Prisma.

## Prerequisites

- Node.js 20+
- Docker (optional, for local Postgres) or any PostgreSQL instance

## Quick start

1. **Start Postgres** (Docker example):

   ```bash
   docker compose up -d
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set `AUTH_SECRET` to a long random string.  
   Set `DATABASE_URL` if it differs from the example.  
   For Google SSO, create an OAuth **Web application** client in Google Cloud Console and add this redirect URI:

   `http://localhost:3000/api/auth/callback/google`

   Then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env`.

3. **Install & database**

   ```bash
   npm install
   npx prisma generate
   docker compose up -d
   npx prisma db push
   npm run dev
   ```

   If `db push` fails with authentication errors, ensure Postgres is running and `DATABASE_URL` in `.env` matches your database user, password, and database name.

   **Windows / PowerShell:** if Prisma still connects to the wrong port (for example an old `5433`) even after you changed `.env`, your shell may have a stale `DATABASE_URL` process variable (Prisma won’t override an already-set env var). Run `Remove-Item Env:DATABASE_URL` in that session, then `npx prisma db push` again.

   Postgres is exposed on host port **`55432`** (see `docker-compose.yml`) to reduce clashes with other Postgres instances.

4. Open [http://localhost:3000](http://localhost:3000). Use **Log in** → send OTP → read the **6-digit code from the terminal** where `npm run dev` is running → verify. Or use **Continue with Google** when Google env vars are set.

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run clean`    | Deletes `.next` (fixes stale chunk / `ENOENT` errors) |
| `npm run dev`      | Next.js dev server         |
| `npm run build`    | Production build           |
| `npm run start`    | Start production server    |
| `npm run db:push`  | Sync Prisma schema to DB   |
| `npm run db:studio`| Prisma Studio              |

### If you see `ENOENT ... vendor-chunks\\next-auth.js`

1. Stop the dev server.
2. Run `npm run clean` (or delete the `.next` folder manually).
3. Run `npm run dev` again.

`next.config.ts` includes `transpilePackages: ["next-auth"]` so Auth.js is bundled consistently on Windows.

## Colleges directory (demo)

The home page **Explore → Top Colleges** tab loads a **nationwide demo index** via `GET /api/colleges`:

- **All states & union territories (36)** with **district counts aligned to ~766** administrative units.
- **Named districts** for several large states (e.g. Maharashtra, Karnataka, UP, Tamil Nadu, Kerala, West Bengal, Gujarat); other states use numbered revenue units until you plug in a full district master file.
- **About 22 sample institutions per district**, of which **16 are B.Tech / engineering–oriented** (explicit `courses` text includes **B.Tech** for search). Remaining rows are other streams (MBA, MBBS, etc.). All are **deterministic placeholders** — not official AICTE/UDISE records.

Use **state / district / search / pagination** in the UI. **View Details** opens `/colleges/detail?id=…`. Swap `lib/colleges-index.ts` + `lib/india-geo.ts` for your real data pipeline when ready.

## Legacy prototypes

The original single-file JSX prototypes remain in the repo root (`edusphere-prototype_new.jsx`, etc.) for reference; the live UI is `components/EduSphereHome.tsx`.
