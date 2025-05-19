import axios from "axios";
import { env } from "@/config/env";

export const axiosClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 10000,
});
