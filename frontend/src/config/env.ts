// frontend/src/config/env.ts
// Basic placeholder for env variables
// A more robust solution with Zod validation is described in frontArch.md

interface AppEnv {
  VITE_API_URL: string;
  VITE_MAP_PROVIDER: string;
}

// Vite provides import.meta.env. VITE_API_URL and VITE_MAP_PROVIDER are expected to be in your .env file.
const importMetaEnv = typeof import.meta !== "undefined" ? import.meta.env : {};

export const env: AppEnv = {
  VITE_API_URL: importMetaEnv.VITE_API_URL || "http://localhost:3000/api", // Default for local dev
  VITE_MAP_PROVIDER: importMetaEnv.VITE_MAP_PROVIDER || "openstreetmap",
};

// Ensure VITE_MAP_PROVIDER has a fallback if not set
if (!env.VITE_MAP_PROVIDER) {
  console.warn(
    'VITE_MAP_PROVIDER is not set in .env. Defaulting to "openstreetmap".',
  );
  env.VITE_MAP_PROVIDER = "openstreetmap";
}

if (!importMetaEnv.VITE_API_URL) {
  console.warn(
    `VITE_API_URL is not set in .env. Defaulting to "${env.VITE_API_URL}".`,
  );
}
if (!importMetaEnv.VITE_MAP_PROVIDER) {
  console.warn(
    `VITE_MAP_PROVIDER is not set in .env. Defaulting to "${env.VITE_MAP_PROVIDER}".`,
  );
}
