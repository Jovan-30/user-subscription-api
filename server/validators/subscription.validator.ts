import { z } from "zod";
import {
  currencyField,
  frequencyField,
  categoryField,
  statusField,
  subscriptionNameField,
  paymentMethodField,
} from "./common.validator.ts";

// POST: /api/v1/subscriptions
export const createSubscriptionValidator = z
  .object({
    name: subscriptionNameField,
    price: z.number().min(0, "Subscription price cannot be less than 0"),
    currency: currencyField,
    frequency: frequencyField,
    category: categoryField,
    paymentMethod: paymentMethodField,
    status: statusField.optional().default("Active"),
    startDate: z
      .string()
      .datetime({ message: "Start date must be a valid ISO datetime string" })
      .transform((val) => new Date(val)), // Transform string to native JS Date object for Mongoose
    renewalDate: z
      .string()
      .datetime({ message: "Renewal date must be a valid ISO datetime string" })
      .transform((val) => new Date(val)),
  })
  .strict();

// PATCH: /api/v1/subscriptions/:id
export const updateSubscriptionValidator = z
  .object({
    name: subscriptionNameField.optional(),
    paymentMethod: paymentMethodField.optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.paymentMethod !== undefined,
    { message: "At least one editable field must be provided." },
  );
