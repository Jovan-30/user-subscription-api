import { Router } from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controller.ts";
import {
  signInValidator,
  signUpValidator,
} from "../validators/auth.validator.ts";
import { validateRequestBody } from "../middleware/validate.middleware.ts";

const authRouter = Router();

authRouter.post("/sign-up", validateRequestBody(signUpValidator), signUp);
authRouter.post("/sign-in", validateRequestBody(signInValidator), signIn);
authRouter.post("/sign-out", signOut);

export default authRouter;
