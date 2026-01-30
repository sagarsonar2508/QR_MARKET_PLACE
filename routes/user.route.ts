import { Router } from "express";
import { login, emailSignup, googleSignup, verifyEmail, setPassword } from "../controllers/user.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { loginRequestSchema, emailSignupSchema, googleSignupSchema, verifyEmailSchema, setPasswordSchema } from "../middlewares/user.validation";

const router = Router();

// Authentication endpoints
router.post("/login", validateRequest(loginRequestSchema), login);
router.post("/signup/email", validateRequest(emailSignupSchema), emailSignup);
router.post("/signup/google", validateRequest(googleSignupSchema), googleSignup);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/set-password", validateRequest(setPasswordSchema), setPassword);

export default router;
