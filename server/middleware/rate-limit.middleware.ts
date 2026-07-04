import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.config.ts";
import AppError from "../errors/app.error.ts";

const WINDOW_SIZE_SECONDS = 60; // duration of one minute
const MAX_REQUESTS_PER_WINDOW = 50; // max requests per user within the window

export async function rateLimitRedis(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Raw IP Address: prevent from registering proxy server itself instead of actual user
    const rawIP = req.ip || req.headers["x-forwarded-for"] || "unknown"; // unknown as fallback to prevent crash

    // Safe Guard: get first IP address in case it's a comma seperated proxy list and trim for typescript check
    const firstIP = typeof rawIP === "string" ? rawIP.split(",")[0] : "unknown";
    const clientIP = firstIP?.trim() || "unknown";

    // Create Redis Key: unique tracking for this IP address
    const redisKey = `redis:ratelimit:${clientIP}`;

    // Request Counter: increment the request count
    const requestCount = await redisClient.incr(redisKey);

    // Start Window Size: start one minute countdown after first request
    if (requestCount === 1) {
      await redisClient.expire(redisKey, WINDOW_SIZE_SECONDS);
    }

    if (requestCount > MAX_REQUESTS_PER_WINDOW) {
      throw new AppError(429, "Too Many Requests. Please Try Again Later");
    }

    // Enforce Front-End Rules: frontend header need to know and enforce the rules
    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS_PER_WINDOW - requestCount),
    );

    return next();
  } catch (error: unknown) {
    // Expected Rate Limit Error: if it's a rate limit block pass it global error middleware
    if (error instanceof AppError) {
      return next(error);
    }

    // Memurai Crash: if error then log it to server for resolve
    console.error(
      `Memurai (Redis) Rate Limit. Internal Server Error: ${error}`,
    );
    return next();
  }
}
