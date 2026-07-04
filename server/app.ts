import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import authRouter from "./routes/auth.routes.ts";
import userRouter from "./routes/user.routes.ts";
import subscriptionRouter from "./routes/subscription.route.ts";
import type { Application } from "express";
import { errorMiddleware } from "./middleware/error.middleware.ts";
import { rateLimitRedis } from "./middleware/rate-limit.middleware.ts";

const app: Application = express();

// Middleware
// Security Headers & Cors
app.use(helmet());
app.use(cors({ origin: `*` }));

// Performance Optimization
app.use(compression());

// Data Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis (Memurai) Rate Limitingso it's
app.use(rateLimitRedis);

// Routing Configuration
app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/subscriptions`, subscriptionRouter);

// Global Error Handling (Internal Server Error)
app.use(errorMiddleware);

export default app;
