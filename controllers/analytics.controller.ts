import type { Request, Response } from "express";
import {
  getQRCodeAnalyticsService,
  getQRCodeStatsService,
} from "../services/business-service/analytics/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";

export const getQRCodeAnalytics = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await getQRCodeAnalyticsService(req.params.qrCodeId as string, userId);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Analytics retrieved successfully",
  });
});

export const getQRCodeStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await getQRCodeStatsService(req.params.qrCodeId as string, userId);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Analytics stats retrieved successfully",
  });
});
