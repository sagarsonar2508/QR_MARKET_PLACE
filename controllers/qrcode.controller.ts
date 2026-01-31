import type { Request, Response } from "express";
import {
  createQRCodeService,
  getQRCodeByIdService,
  getQRCodeBySlugService,
  getQRCodesByUserIdService,
  updateQRCodeService,
  rotateLinkService,
  disableQRCodeService,
  deleteQRCodeService,
} from "../services/business-service/qrcode/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";
import { createAnalyticsService } from "../services/business-service/analytics/modules.export";
import type { AuthRequest } from "../middlewares/authenticate";

export const createQRCode = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await createQRCodeService(req.body, userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.CREATED,
    data: response,
    message: "QR Code created successfully",
  });
});

export const getQRCode = catchAsync(async (req: Request, res: Response) => {
  const response = await getQRCodeByIdService(req.params.id as string);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "QR Code retrieved successfully",
  });
});

export const getUserQRCodes = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await getQRCodesByUserIdService(userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "QR Codes retrieved successfully",
  });
});

export const updateQRCode = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await updateQRCodeService(req.params.id as string, userId.toString(), req.body);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "QR Code updated successfully",
  });
});

export const rotateLink = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await rotateLinkService(req.params.id as string, userId.toString(), req.body);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "QR Code link rotated successfully",
  });
});

export const disableQRCode = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await disableQRCodeService(req.params.id as string, userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "QR Code disabled successfully",
  });
});

export const deleteQRCode = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await deleteQRCodeService(req.params.id as string, userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "QR Code deleted successfully",
  });
});

// Public endpoint to redirect QR code
export const redirectQRCode = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  const qrcode = await getQRCodeBySlugService(slug as string);
  
  // Create analytics entry
  try {
    await createAnalyticsService({
      qrCodeId: qrcode._id!,
      ip: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      city: (req as any).geoLocation?.city || "unknown",
    });
  } catch (error) {
    // Don't fail the request if analytics fails
    console.error("Analytics error:", error);
  }

  // Redirect to destination URL
  res.redirect(301, qrcode.destinationUrl);
});
