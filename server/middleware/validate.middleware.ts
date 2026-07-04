import { ZodAny, ZodType, type ZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app.error.ts";

/*
  Higher Order Function: bypass express parameter limitations
  Closure: thus inner function retain access to the schema
*/
export const validateRequestBody = (schema: ZodObject | ZodAny | ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Input Validation: explicit input validation with zod
      const result = await schema.safeParseAsync(req.body);
      if (!result.success) throw new AppError(400, "Input Validation Failed");

      req.body = result.data;

      return next();
    } catch (error: unknown) {
      return next(error);
    }
  };
};
