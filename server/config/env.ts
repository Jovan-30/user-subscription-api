import { config } from "dotenv";
import { environmentValidator } from "../validators/environment.validator.ts";

// if NODE_ENV exists, if not default to development
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

// validate all the environment variables at startup
const result = environmentValidator.safeParse(process.env);

if (!result.success) {
  console.error(`Invalid Environment Variables: ${result.error}`);
  throw new Error("Environment Validation Failed");
}

export const { PORT, NODE_ENV, DB_URI, JWT_SECRET, JWT_EXPIRES_IN, REDIS_URL } =
  result.data;
