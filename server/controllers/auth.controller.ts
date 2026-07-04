import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AppError from "../errors/app.error.ts";
import type { NextFunction, Request, Response } from "express";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.ts";
import { UserModel } from "../models/user.model.ts";

// POST: /api/v1/auth/sign-up
export async function signUp(req: Request, res: Response, next: NextFunction) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, email, firstName, lastName, password } = req.body;

    // User Check: check if user already exists in the database
    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new AppError(409, "User Already Exists");
    }

    // Hash Password: password protection with salt and bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create New User: add the new user to the database
    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName,
      ...(lastName ? { lastName } : {}),
    };
    const newUser = await UserModel.create([userData], { session });

    // Commit Transaction: user successfully registered
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "User Successfully Created",
      data: {
        _id: newUser[0]?._id,
        username,
      },
    });
  } catch (error: unknown) {
    await session.abortTransaction();

    return next(error);
  } finally {
    await session.endSession();
  }
}

// POST: /api/v1/auth/sign-in
export async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;

    // Username/Email Validation: ensure that the username or email exists for sign-in
    const existingUser = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    })
      .select("+password")
      .lean();
    if (!existingUser) {
      throw new AppError(401, "Invalid Username/Email or Password");
    }

    // Password Validation: ensure that the password matches with the one saved in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid Username/Email or Password");
    }

    // Token: generate a toke with jwt
    const token = jwt.sign(
      {
        _id: existingUser._id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // Successful Sign-In: user successfully signed in
    return res.status(200).json({
      success: true,
      message: "User Sign In Successful",
      data: {
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
        },
        token,
      },
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// POST: /api/v1/auth/sign-out
export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({
      success: true,
      message: "User Successfully Signed Out",
    });
  } catch (error: unknown) {
    return next(error);
  }
};
