interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_MAP_PROVIDER?: string;
  VITE_DEBUG_MODE?: string;
}

interface AppEnv {
  VITE_API_URL: string;
  VITE_MAP_PROVIDER: string;
  VITE_DEBUG_MODE: boolean;
}

// Get environment variables from Vite's import.meta.env
const importMetaEnv: ImportMetaEnv =
  typeof import.meta !== "undefined" ? (import.meta.env as ImportMetaEnv) : {};

// Set default values for environment variables
export const env: AppEnv = {
  VITE_API_URL: importMetaEnv.VITE_API_URL || "http://localhost:3000/api",
  VITE_MAP_PROVIDER: importMetaEnv.VITE_MAP_PROVIDER || "openstreetmap",
  VITE_DEBUG_MODE:
    (importMetaEnv.VITE_DEBUG_MODE &&
      importMetaEnv.VITE_DEBUG_MODE === "true") ||
    true,
};
