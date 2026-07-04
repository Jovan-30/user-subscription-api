import AppError from "../errors/app.error.ts";
import type { NextFunction, Request, Response } from "express";
import type { UserInterface } from "../types/schema.types.ts";
import { SubscriptionModel } from "../models/subscription.model.ts";
import { Types } from "mongoose";

// GET: /api/v1/subscriptions
export async function getSubscriptions(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const subscriptions = await SubscriptionModel.find({
      user: req.user._id,
    }).lean();

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// GET: /api/v1/subscriptions/expired
export async function getUpcomingRenewals(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const upcomingRenewals = await SubscriptionModel.find({
      status: "Expired",
    }).lean();

    res.status(200).json({
      success: true,
      data: upcomingRenewals,
      count: upcomingRenewals.length,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// GET: /api/v1/subscriptions/:id
export async function getSubscriptionDetails(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const subscription = await SubscriptionModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!subscription) throw new AppError(404, "Subscription Not Found");

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// POST: /api/v1/subscriptions
export async function createSubscription(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const subscriptionData = {
      ...req.body,
      user: req.user._id,
    };

    const createdSubscription =
      await SubscriptionModel.create(subscriptionData);

    res.status(201).json({
      success: true,
      data: createdSubscription,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// PATCH: /api/v1/subscriptions/:id
export async function updateSubscription(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const { name, paymentMethod } = req.body;
    const options = { new: true, runValidators: true };

    const updatedSubscription = await SubscriptionModel.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { $set: { name, paymentMethod } },
      options,
    ).lean();

    if (!updatedSubscription) {
      throw new AppError(404, "Subscription Not Found");
    }

    res.status(200).json({
      success: true,
      message: "Subscription Updated Successfully",
      data: updatedSubscription,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

// PUT: /api/v1/subscriptions/:id/cancel
export async function cancelSubscription(
  req: Request & { user?: UserInterface },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const options = { new: true, runValidators: true };

    const cancelledSubscription = await SubscriptionModel.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { $set: { status: "Cancelled" } },
      options,
    ).lean();

    if (!cancelledSubscription)
      throw new AppError(404, "Subscription Not Found");

    res.status(200).json({
      success: true,
      message: "Subscription Cancelled Successfully",
      data: cancelledSubscription,
    });
  } catch (error: unknown) {
    return next(error);
  }
}
