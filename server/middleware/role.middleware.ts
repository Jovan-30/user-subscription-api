import type { Request, Response, NextFunction } from "express";
import type { UserInterface } from "../types/schema.types.ts";
import AppError from "../errors/app.error.ts";
import type { UserRolesType } from "../types/common.types.ts";

/*
  Higher Order Function: bypass express parameter limitations
  Closure: thus inner function retain access to the roleSet
*/
export const hasRole = (allowedRoles: UserRolesType[]) => {
  const roleSet = new Set<UserRolesType>(allowedRoles); // for faster runtime (than includes)

  return (
    req: Request & { user?: UserInterface },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Auth Validation: ensure that the user has been verified
      if (!req.user) {
        throw new AppError(401, "Unauthorized");
      }

      // Verify Role: check the user role and verify if it's part of the allowed roles set
      const checkRole = roleSet.has(req.user.role);
      if (!checkRole) {
        throw new AppError(403, "Forbidden"); // authenticated but lacking permissions
      }

      return next();
    } catch (error: unknown) {
      return next(error);
    }
  };
};

export const isAdmin = hasRole(["admin"]);
export const isModerator = hasRole(["moderator"]);
export const isManagement = hasRole(["admin", "moderator"]);
