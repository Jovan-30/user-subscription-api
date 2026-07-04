import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import AppError from "../errors/app.error.ts";
import { NODE_ENV } from "../config/env.ts";

// Global Error Handling (Internal Server Error)
export const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";
  const stack = err.stack || "No Stack";
  const isOperational = err.isOperational;

  // Error Context: internal logging of the error
  console.error(
    `[API Error] Status: ${statusCode} | Message: ${message} | Stack: ${stack}`,
  );

  // Development Error Response: return the stack, message and full error
  if (NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      stack,
      error: err,
    });
  }

  // Production Error Response: controlled output for custom AppError and libraries (mongodb, zod)
  if (err instanceof AppError || isOperational === true || statusCode === 429) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Safeguard: final safety error check for unexpected error (prevent server leaks)
  return res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
};
