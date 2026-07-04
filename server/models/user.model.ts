import { Schema, model } from "mongoose";
import type { UserInterface } from "../types/schema.types.ts";

const userSchema = new Schema<UserInterface>(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, `User name is required`],
      minLength: [2, `Username must be at least 2 characters`],
      maxLength: [50, `Username can be no larger than 50 characters`],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      minLength: [2, `Email must be at least 2 characters`],
      maxLength: [100, `Email can be no larger than 100 characters`],
      match: [/.+\@.+\..+/, `Must be a valid email address`],
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
      minLength: [2, `First name must be at least 2 characters`],
      maxLength: [50, `First name can be no larger than 50 characters`],
    },
    lastName: {
      type: String,
      trim: true,
      required: false,
      minLength: [2, `Last name must be at least 2 characters`],
      maxLength: [50, `Last name can be no larger than 50 characters`],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
      minLength: [6, `Password must be at least 6 characters`],
      maxLength: [100, `Password can be no larger than 100 characters`],
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["admin", "user", "moderator"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
    },
  },
  { timestamps: true },
);

// Create UserModel:
export const UserModel = model<UserInterface>("User", userSchema);
