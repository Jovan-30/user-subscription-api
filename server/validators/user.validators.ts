import { z } from "zod";
import {
  firstNameField,
  lastNameField,
  passwordField,
  roleField,
} from "./common.validator.ts";

// PATCH: /api/v1/users/me
export const updateMeValidator = z
  .object({
    firstName: firstNameField.optional(),
    lastName: lastNameField.optional(),
  })
  .strict()
  // Check: make sure at least one field is provided otherwise no update
  .refine(
    (data) => data.firstName !== undefined || data.lastName !== undefined,
    {
      message: "At least one editable field must be provided.",
    },
  );

// PUT: /api/v1/users/me/security/update-password
export const updatePasswordValidator = z.object({
  oldPassword: z.string().min(1, "Current Password is Required"),
  newPassword: passwordField,
});

export const updateUserRoleValidator = z
  .object({
    role: roleField,
  })
  .strict();
