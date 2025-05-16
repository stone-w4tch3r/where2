# Where2 Backend

This is the backend service for the Where2 application, providing API endpoints for stations, routes, and reachability calculations.

## Getting Started

### Prerequisites

- Node.js 16+
- PNPM package manager
- PostgreSQL database

### Setup

1. Create and migrate the database

```bash
npx prisma migrate dev --name init
```

2. Generate Prisma client

```bash
npx prisma generate
```

### Running the Service

#### Development Mode

```bash
pnpm dev
```

This starts the server with hot reloading at http://localhost:8080

## Data Import

To import data from Yandex.Rasp API, you need to trigger the data processor:

```bash
curl -X POST http://localhost:8080/api/admin/process-data
```

This will:

1. Fetch stations in Sverdlovsk region
2. Extract routes for these stations
3. Save everything to the database
