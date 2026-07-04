import { createClient } from "redis";
import { REDIS_URL } from "./env.ts";
import AppError from "../errors/app.error.ts";
import type { CacheTTLInterface } from "../types/redis.types.ts";

export const redisClient = createClient({
  url: REDIS_URL,
});

// Handle Events: ensure handling all the connection evens
redisClient.on("connect", () => console.log("Redis Client Connecting..."));
redisClient.on("ready", () => console.log("Redis Client Connected and Ready!"));
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("reconnecting", () =>
  console.warn("Redis Client: Attempting to reconnect..."),
);
redisClient.on("end", () =>
  console.warn("Redis Client: Connection closed completely."),
);

export async function connectToRedis() {
  try {
    // Connection Attempt: ensure that the client is initialized and usable
    if (!redisClient.isReady) await redisClient.connect();
  } catch (error: unknown) {
    await redisClient.destroy();
    console.error("Could not connect to Redis", error);

    throw new AppError(500, "Internal Server Error");
  }
}

export const CACHE_TTL: CacheTTLInterface = {
  SHORT_TTL_CACHE: 300,
  MEDIUM_TTL_CACHE: 3600,
  LONG_TTL_CACHE: 86400,
};

export const { SHORT_TTL_CACHE, MEDIUM_TTL_CACHE, LONG_TTL_CACHE } = CACHE_TTL;
