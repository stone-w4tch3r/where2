Here’s a simplified and more concise version of your README, keeping all useful content:

---

# Where2 Backend (NestJS)

Backend API for stations, routes, reachability, and data import.

## Prerequisites

- Node.js
- pnpm
- Supabase (or local Postgres)

## Setup

1. **Configure environment:**
   - Copy and edit `.env`:
     ```bash
     cp .env.example .env
     # Edit with your DB credentials
     ```

3. **Database:**
   - Set up Supabase or local Postgres.
   - Update `DATABASE_URL` and `DIRECT_URL` in `.env`.
   - Run migrations:
     ```bash
     pnpm exec prisma migrate deploy
     ```
4. **Start server:**
   ```bash
   pnpm start:dev
   ```
   Runs at http://localhost:8080

## Db

### supabase

1. **Create a Supabase project**
2. Go to project > Settings > Database and copy the connection string.
3. Set up your environment variables in a `.env` file:

```
# .env
DATABASE_URL="<your-supabase-connection-string>?pgbouncer=true"
DIRECT_URL="<your-supabase-direct-connection-string>"
```

- `DATABASE_URL` should use the connection pooler port (usually 6543) and include `?pgbouncer=true`.
- `DIRECT_URL` should use the direct Postgres port (usually 5432).

### Local Postgres with Docker

Run in `backend/`: `docker compose up -d -f docker-comose-db.yml`

Use these in `.env`:

```
DATABASE_URL="postgresql://where2:where2pass@localhost:5432/where2db"
DIRECT_URL="postgresql://where2:where2pass@localhost:5432/where2db"
```

## Data Import

- **Automatic:** Set schedule in `.env`:
  ```
  DATA_IMPORT_CRON="0 2 * * *"
  DATA_IMPORT_TIMEZONE="Europe/Moscow"
  DATA_IMPORT_ENABLED=true
  ```
- **Manual:** Run:
  ```bash
  curl -X POST http://localhost:8080/api/admin/process-data
  ```

## Scripts

- `pnpm exec prisma migrate deploy` — Run migrations
- `pnpm start:dev` — Start dev server

