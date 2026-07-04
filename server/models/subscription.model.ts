import { model, Schema } from "mongoose";
import type { SubscriptionInterface } from "../types/schema.types.ts";

const subscriptionSchema = new Schema<SubscriptionInterface>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Reference is required"],
    },
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      minLength: [2, `Username must be at least 2 characters`],
      maxLength: [50, `Username can be no larger than 50 characters`],
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      minLength: [0, `Price must be equal to or greater than 0`],
    },
    currency: {
      type: String,
      enum: {
        values: ["CAD", "EUR", "GBP"],
        message: "{VALUE} is not a valid currency",
      },
      default: "CAD",
    },
    frequency: {
      type: String,
      enum: {
        values: ["daily", "weekly", "biweekly", "monthly", "yearly"],
        message: "{VALUE} is not a valid frequency",
      },
      default: "weekly",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["sports", "news", "entertainment", "technology"],
        message: "{VALUE} is not a valid category",
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Cancelled", "Expired"],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    renewalDate: {
      type: Date,
      required: [true, "Renewal date is required"],
    },
  },
  { timestamps: true },
);

// create the subscription model
export const SubscriptionModel = model<SubscriptionInterface>(
  "Subscription",
  subscriptionSchema,
);
