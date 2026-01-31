import type { CreateAnalyticsRequestData } from "../../dto-service/modules.export";
import {
  createAnalyticsEntry,
  getAnalyticsByQRCode,
  getAnalyticsStats,
} from "../../persistence-service/analytics/modules.export";
import { getQRCodeById } from "../../persistence-service/qrcode/modules.export";
import { AppError } from "../../helper-service/AppError";

export const createAnalyticsService = async (data: CreateAnalyticsRequestData) => {
  return await createAnalyticsEntry(data);
};

export const getQRCodeAnalyticsService = async (qrCodeId: string, userId: string) => {
  const qrcode = await getQRCodeById(qrCodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  if (qrcode.userId !== userId) {
    throw new AppError("Unauthorized to view analytics for this QR code", 403);
  }

  return await getAnalyticsByQRCode(qrCodeId);
};

export const getQRCodeStatsService = async (qrCodeId: string, userId: string) => {
  const qrcode = await getQRCodeById(qrCodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  if (qrcode.userId !== userId) {
    throw new AppError("Unauthorized to view stats for this QR code", 403);
  }

  return await getAnalyticsStats(qrCodeId);
};
