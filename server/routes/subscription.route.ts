import { Router } from "express";
import {
  getSubscriptions,
  getExpiredRenewals,
  getSubscriptionDetails,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.ts";
import { auth } from "../middleware/auth.middleware.ts";
import { cacheMiddleware } from "../middleware/cache.middleware.ts";
import { SHORT_TTL_CACHE } from "../config/redis.config.ts";
import { validateRequestBody } from "../middleware/validate.middleware.ts";
import {
  createSubscriptionValidator,
  updateSubscriptionValidator,
} from "../validators/subscription.validator.ts";
import { isManagement } from "../middleware/role.middleware.ts";

const subscriptionRouter = Router();

// Middleware: auth middleware
subscriptionRouter.use(auth);

// Read Operations
subscriptionRouter.get("/", cacheMiddleware(SHORT_TTL_CACHE), getSubscriptions);
subscriptionRouter.get(
  "/expired",
  isManagement,
  cacheMiddleware(SHORT_TTL_CACHE),
  getExpiredRenewals,
);
subscriptionRouter.get(
  "/:id",
  cacheMiddleware(SHORT_TTL_CACHE),
  getSubscriptionDetails,
);

// Mutation Operations
subscriptionRouter.post(
  "/",
  validateRequestBody(createSubscriptionValidator),
  createSubscription,
);
subscriptionRouter.patch(
  "/:id",
  validateRequestBody(updateSubscriptionValidator),
  updateSubscription,
);
subscriptionRouter.put("/:id/cancel", cancelSubscription);

export default subscriptionRouter;
