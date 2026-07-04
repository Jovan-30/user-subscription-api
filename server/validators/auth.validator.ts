import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  passwordField,
  usernameField,
} from "./common.validator.ts";

// POST: /api/v1/auth/sign-up
export const signUpValidator = z
  .object({
    username: usernameField,
    email: emailField,
    firstName: firstNameField,
    lastName: lastNameField.optional(),
    password: passwordField,
  })
  .strict();

// POST: /api/v1/auth/sign-in
export const signInValidator = z
  .object({
    identifier: z.union([usernameField, emailField]),
    password: passwordField,
  })
  .strict();
