import type { Request, Response, NextFunction } from "express";
import type { CacheTTLInterface } from "../types/redis.types.ts";
import AppError from "../errors/app.error.ts";
import { redisClient } from "../config/redis.config.ts";
import type { UserInterface } from "../types/schema.types.ts";

/*
  Higher Order Function: bypass express parameter limitations
  Closure: thus inner function retain access to the ttlSeconds
*/
export function cacheMiddleware(
  ttlSeconds: CacheTTLInterface[keyof CacheTTLInterface],
) {
  return async (
    req: Request & { user?: UserInterface },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Cache Only: only want to cache GET requests
      if (req.method !== "GET") {
        return next();
      }

      // Cached Scope: this is to seperate /me endpoints from public ones
      const cachedScope = req.user?._id ? `user:${req.user._id}` : `public`;

      // Create Redis Key: unique id to store and retrieve cached API responses
      const redisKey = `redis:cache:${cachedScope}:${req.originalUrl || req.url}`;

      // Cache Exists: check if cached data already exists in Redis (Memurai)
      const cachedResponse = await redisClient.get(redisKey);

      // Enforce Front-End Rules: frontend header need to know and enforce the rules
      if (cachedResponse) {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // Cache Not Exists: not cached data thus fetching from the database
      res.setHeader("X-Cache", "MISS");

      const sendJson = res.json.bind(res);

      // Override: the res.json with a custom function for middleware to grab data before it leaves server
      // Response: cache successful responses
      res.json = (body: any): Response => {
        if (res.statusCode === 200) {
          // Save To Redis
          redisClient
            .setEx(redisKey, ttlSeconds, JSON.stringify(body))
            .catch((err) =>
              console.error(`Redis (Memurai) Error: Key - [${redisKey}]:`, err),
            );
        }
        return sendJson(body); // send copy otherwise infinite loop
      };

      return next();
    } catch (error: unknown) {
      // Expected Cache Error: if it's an expected cache error pass it to global error middleware
      if (error instanceof AppError) {
        return next(error);
      }

      // Memurai Crash: if error then log it to server for resolve
      console.error(`Memurai (Redis) Cache. Internal Server Error: ${error}`);
      return next();
    }
  };
}
