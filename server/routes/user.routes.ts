import { Router } from "express";
import { auth } from "../middleware/auth.middleware.ts";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteCurrentUserAccount,
  updatePassword,
  getUser,
  getUsers,
  updateUserRoleWithAdmin,
  forceDeleteUserAccount,
} from "../controllers/user.controller.ts";
import {
  updateMeValidator,
  updatePasswordValidator,
  updateUserRoleValidator,
} from "../validators/user.validators.ts";
import { isAdmin, isManagement } from "../middleware/role.middleware.ts";
import { validateRequestBody } from "../middleware/validate.middleware.ts";
import { cacheMiddleware } from "../middleware/cache.middleware.ts";
import { MEDIUM_TTL_CACHE, SHORT_TTL_CACHE } from "../config/redis.config.ts";

const userRouter = Router();

// Middleware: auth middleware
userRouter.use(auth);

// Routes:
// Profile Managagement: self-service routes
userRouter.get("/me", cacheMiddleware(SHORT_TTL_CACHE), getCurrentUserProfile);
userRouter.patch(
  "/me",
  validateRequestBody(updateMeValidator),
  updateCurrentUserProfile,
);
userRouter.delete("/me", deleteCurrentUserAccount);
userRouter.put(
  "/me/security/update-password",
  validateRequestBody(updatePasswordValidator),
  updatePassword,
);

// Admin and Management Operations: operations for moderators and admin
userRouter.get("/", isAdmin, cacheMiddleware(SHORT_TTL_CACHE), getUsers);
userRouter.get("/:id", isManagement, cacheMiddleware(SHORT_TTL_CACHE), getUser);
userRouter.patch(
  "/:id/role",
  isAdmin,
  validateRequestBody(updateUserRoleValidator),
  updateUserRoleWithAdmin,
);
userRouter.delete("/:id", isAdmin, forceDeleteUserAccount);

export default userRouter;
