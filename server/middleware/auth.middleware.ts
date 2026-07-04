import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app.error.ts";
import { JWT_SECRET } from "../config/env.ts";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.ts";
import type { UserInterface } from "../types/schema.types.ts";

export const auth = async (
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate Bearer Header: check for missing or incorrect bearer header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Unauthorized");
    }

    // Token Splitting: split to handle whitespace issues on front-end/testing
    const tokenParts = authHeader.split(/\s+/);
    if (tokenParts.length !== 2) {
      throw new AppError(401, "Unauthorized");
    }

    const token = tokenParts[1];
    if (!token) {
      throw new AppError(401, "Unauthorized");
    }

    // Verify Token: verify the signature with JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const user = await UserModel.findById(decoded._id).lean();
    if (!user) {
      throw new AppError(401, "Unauthorized");
    }

    // Assign to Request
    req.user = user as UserInterface;

    return next();
  } catch (error: unknown) {
    return next(error);
  }
};
