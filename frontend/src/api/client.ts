import axios from "axios";
import { env } from "@/config/vite-env";

export const axiosClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 10000,
});

// Log current baseURL to debug any environment issues
console.log("API baseURL:", env.VITE_API_URL);
