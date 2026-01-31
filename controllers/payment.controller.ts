import type { Request, Response } from "express";
import {
  initiatePaymentService,
  verifyPaymentService,
  handlePaymentWebhookService,
} from "../services/business-service/payment/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";

export const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const response = await initiatePaymentService(req.body);
  sendResponse(res, {
    status: HttpStatusCode.CREATED,
    data: response,
    message: "Payment initiated successfully",
  });
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const response = await verifyPaymentService(req.body);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Payment verified successfully",
  });
});

export const paymentWebhook = catchAsync(async (req: Request, res: Response) => {
  const response = await handlePaymentWebhookService(req.body);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Webhook processed",
  });
});
