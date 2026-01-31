import { Router } from "express";
import { paymentWebhook } from "../controllers/payment.controller";
import { handlePrintProviderWebhook } from "../services/helper-service/print-webhook.handler";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";
import type { Request, Response } from "express";

const router = Router();

// Payment webhook
router.post("/payment", paymentWebhook);

// Print provider webhook (Printful/Printify)
router.post(
  "/print",
  catchAsync(async (req: Request, res: Response) => {
    await handlePrintProviderWebhook(req.body);
    sendResponse(res, {
      status: HttpStatusCode.OK,
      data: { message: "Webhook processed successfully" },
      message: "Print webhook handled",
    });
  })
);

export default router;
