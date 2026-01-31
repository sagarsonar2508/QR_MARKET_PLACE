import { Router } from "express";
import {
  initiatePayment,
  verifyPayment,
  paymentWebhook,
} from "../controllers/payment.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { initiatePaymentSchema, verifyPaymentSchema } from "../middlewares/payment/modules.export";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// Protected routes
router.post("/create", authenticate, validateRequest(initiatePaymentSchema), initiatePayment);
router.post("/verify", authenticate, validateRequest(verifyPaymentSchema), verifyPayment);

// Webhook - no authentication (signed by provider)
router.post("/webhook", paymentWebhook);

export default router;
