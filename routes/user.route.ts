import { Router } from "express";
import { emailSignup, googleSignup, verifyEmail, setPassword, login } from "../controllers/user.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { emailSignupSchema, googleSignupSchema, verifyEmailSchema, setPasswordSchema, loginRequestSchema } from "../middlewares/user/modules.export";

const router = Router();

router.post("/login", validateRequest(loginRequestSchema), login);
router.post("/signup/email", validateRequest(emailSignupSchema), emailSignup);
router.post("/signup/google", validateRequest(googleSignupSchema), googleSignup);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post("/set-password", validateRequest(setPasswordSchema), setPassword);

export default router;
