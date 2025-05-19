import { z } from "zod";

export const env = z
  .object({
    VITE_API_URL: z.string().url(),
    VITE_MAP_PROVIDER: z.string(),
  })
  .parse(import.meta.env);
