import z, { ZodType } from "zod";
import type {
  UserRolesType,
  CurrencyType,
  FrequencyType,
  CategoryType,
  StatusType,
} from "../types/common.types.ts";

export const usernameField = z.string().trim().min(2).max(50);
export const emailField = z.email();
export const firstNameField = z.string().toLowerCase().trim().min(2).max(50);
export const lastNameField = z.string().toLowerCase().trim().min(2).max(50);
export const passwordField = z.string().min(6).max(100);
export const roleField = z.enum(["admin", "user", "moderator"], {
  message: "Role must be admin, user (default) or moderator",
} as const) satisfies ZodType<UserRolesType>;

export const paymentMethodField = z
  .string()
  .trim()
  .min(1, "Payment method is required");
export const subscriptionNameField = z
  .string()
  .trim()
  .min(2, "Subscription name must be at least 2 characters")
  .max(50, "Subscription name cannot be longer than 50 characters");
export const currencyField = z.enum([
  "CAD",
  "EUR",
  "GBP",
] as const) satisfies z.ZodType<CurrencyType>;
export const frequencyField = z.enum([
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
] as const) satisfies z.ZodType<FrequencyType>;
export const categoryField = z.enum([
  "sports",
  "news",
  "entertainment",
  "technology",
] as const) satisfies z.ZodType<CategoryType>;
export const statusField = z.enum([
  "Active",
  "Cancelled",
  "Expired",
] as const) satisfies z.ZodType<StatusType>;

// Pagination Query Schema: reusable shard pagination schema
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive number").optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .optional(),
});
