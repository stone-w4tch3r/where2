# Where2 - Suburban Trains Application

A web application for visualizing suburban train routes, schedules, and reachable areas from stations.

## Project Structure

\`\`\`
where2/
├── api/              # API routes and server
├── app/              # Next.js app directory
├── components/       # React components
├── prisma/           # Prisma schema and migrations
├── public/           # Static assets
├── schemas/          # Form schemas
├── types/            # TypeScript type definitions
└── ...               # Configuration files
\`\`\`

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase or other provider)

## Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
DATABASE_URL=your_postgres_url
YANDEX_API_KEY=your_yandex_api_key
\`\`\`

## Development Setup

\`\`\`bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Start the development server
npm run dev

# In a separate terminal, start the API server
npm run api:dev
\`\`\`

The frontend will be available at http://localhost:3000.
The API will be available at http://localhost:3001.

## Building for Production

\`\`\`bash
# Build the Next.js app
npm run build

# Build the API server
npm run api:build

# Start the production server
npm start

# Start the API server
npm run api:start
\`\`\`

## API Documentation

API documentation is available at http://localhost:3001/api-docs when the API server is running.

## Features

- View suburban train routes and stations
- Calculate reachable areas from stations
- View schedules for stations
- Compatible with different map providers

## Data Sources

The application uses the Yandex.Rasp API for train route data, focusing on the Sverdlovsk Region, Russia.
\`\`\`

Let's create a .env.example file:

```plaintext file=".env.example"
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
DATABASE_URL=your_supabase_postgres_url
YANDEX_API_KEY=your_yandex_api_key
