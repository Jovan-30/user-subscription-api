import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model.ts";
import AppError from "../errors/app.error.ts";
import bcrypt from "bcryptjs";
import type { UserInterface } from "../types/schema.types.ts";

// Profile Managagement: self-service controllers
// GET: /api/v1/users/me
export async function getCurrentUserProfile(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// PATCH: /api/v1/users/me
export async function updateCurrentUserProfile(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const { firstName, lastName } = req.body;
    const options = { new: true, runValidators: true };

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $set: { firstName, lastName } },
      options,
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// DELETE: /api/v1/users/me
export async function deleteCurrentUserAccount(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const deletedUser = await UserModel.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: "User Account Deleted",
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// PUT: /api/v1/users/me/security/update-password
export async function updatePassword(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const { oldPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.user._id).select("+password");
    if (!user || !user.password) throw new AppError(404, "Not Found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new AppError(400, "Bad Request");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Security Credential Updated Successfully.",
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// Admin and Management Operations: controllers for moderators and admin
// GET: /api/v1/users
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await UserModel.find().lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// GET: /api/v1/users/:id
export async function getUser(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id).lean();

    if (!user) {
      throw new AppError(404, "User Not Found");
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// PATCH: /api/v1/users/:id/role
export async function updateUserRoleWithAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Fetch User: get the user we want to find
    const updatedRole = await UserModel.findById(req.params.id);
    if (!updatedRole) throw new AppError(404, "User Not Found");

    // Admin Check: ensure that the user is not an admin, can't update and admin
    if (updatedRole.role === "admin") throw new AppError(403, "Forbidden");

    // Update Role: update the user role
    updatedRole.role = req.body.role;
    await updatedRole.save();

    res.status(200).json({
      success: true,
      message: "Role Updated",
      data: updatedRole,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// DELETE: /api/v1/users/:id
export async function forceDeleteUserAccount(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    // Fetch User: get the user we want to find and delete
    const deletedUser = await UserModel.findById(id);
    if (!deletedUser) throw new AppError(404, "User Not Found");

    // Prevent Self-Deletion: do not allow an admin to delete their own account
    if (req.user && req.user._id.toString() === id) {
      throw new AppError(400, "User Can't Delete Own Account");
    }

    // Prevent Admin Deletions: ensure that an admin does not delete another admin
    if (deletedUser.role === "admin") throw new AppError(403, "Forbidden");

    await UserModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User Account Deleted By Admin",
    });
  } catch (error: unknown) {
    return next(error);
  }
}
