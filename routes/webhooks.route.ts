import { Router } from "express";
import { paymentWebhook } from "../controllers/payment.controller";
import { handleShopifyWebhook, verifyShopifyWebhookSignature } from "../services/helper-service/shopify-webhook.handler";
import { handleQikinkWebhook, verifyQikinkWebhookSignature } from "../services/helper-service/qikink-webhook.handler";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";
import type { Request, Response } from "express";

const router = Router();

// Payment webhook (legacy Razorpay)
router.post("/payment", paymentWebhook);

// Shopify order webhook
router.post(
  "/shopify",
  catchAsync(async (req: Request, res: Response) => {
    // Verify Shopify webhook signature
    const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (!verifyShopifyWebhookSignature(rawBody, hmacHeader)) {
      return sendResponse(res, {
        status: HttpStatusCode.UNAUTHORIZED,
        data: { message: "Invalid Shopify webhook signature" },
        message: "Webhook verification failed",
      });
    }

    await handleShopifyWebhook(req.body);
    sendResponse(res, {
      status: HttpStatusCode.OK,
      data: { message: "Shopify webhook processed successfully" },
      message: "Webhook handled",
    });
  })
);

// Qikink fulfillment webhook
router.post(
  "/qikink",
  catchAsync(async (req: Request, res: Response) => {
    // Verify Qikink webhook signature
    const signature = req.headers["x-qikink-signature"] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (!verifyQikinkWebhookSignature(rawBody, signature)) {
      return sendResponse(res, {
        status: HttpStatusCode.UNAUTHORIZED,
        data: { message: "Invalid Qikink webhook signature" },
        message: "Webhook verification failed",
      });
    }

    await handleQikinkWebhook(req.body);
    sendResponse(res, {
      status: HttpStatusCode.OK,
      data: { message: "Qikink webhook processed successfully" },
      message: "Webhook handled",
    });
  })
);

// Legacy print provider webhook (kept for backward compatibility)
// This is deprecated - use Shopify/Qikink webhooks instead
router.post(
  "/print",
  catchAsync(async (req: Request, res: Response) => {
    // Route to appropriate handler based on provider
    const provider = req.body.provider || req.body.type;

    if (provider?.toLowerCase().includes("shopify")) {
      await handleShopifyWebhook(req.body);
    } else if (provider?.toLowerCase().includes("qikink")) {
      await handleQikinkWebhook(req.body);
    } else {
      console.warn(`Unknown print provider in webhook: ${provider}`);
    }

    sendResponse(res, {
      status: HttpStatusCode.OK,
      data: { message: "Print webhook processed" },
      message: "Webhook handled",
    });
  })
);

export default router;
