interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_MAP_PROVIDER?: string;
}

interface AppEnv {
  VITE_API_URL: string;
  VITE_MAP_PROVIDER: string;
}

// Get environment variables from Vite's import.meta.env
const importMetaEnv: ImportMetaEnv =
  typeof import.meta !== "undefined" ? (import.meta.env as ImportMetaEnv) : {};

// Set default values for environment variables
export const env: AppEnv = {
  VITE_API_URL: importMetaEnv.VITE_API_URL || "http://localhost:3000/api",
  VITE_MAP_PROVIDER: importMetaEnv.VITE_MAP_PROVIDER || "openstreetmap",
};
