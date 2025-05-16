# Where2 Backend

Backend service for Where2, providing API endpoints for stations, routes, and reachability.

## Quick Start

### Prerequisites

- Node
- pnpm
- Supabase account (or local Postgres)

### Setup

1. Create a Supabase project or run local Postgres (see below).
2. Add a `.env` file in `backend/`:
   ```bash
   cp .env.example .env
   # than edit
   ```
3. `pnpm install`
4. Start the backend `pnpm dev`. Server runs at http://localhost:8080

### Db with supabase

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

## Import Yandex.Rasp Data

Trigger import:

```bash
curl -X POST http://localhost:8080/api/admin/process-data
```

This fetches stations/routes and saves them to the database
