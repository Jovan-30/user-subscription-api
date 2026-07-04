import { z } from "zod";

export const environmentValidator = z.object({
  PORT: z.string(),
  NODE_ENV: z.enum(["production", "development"]).default("development"),
  DB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.enum(["1d", "7d", "30d"]).default("1d"),
  REDIS_URL: z.string().min(1),
});
