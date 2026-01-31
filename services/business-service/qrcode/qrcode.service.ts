import { nanoid } from "nanoid";
import type { CreateQRCodeRequestData, UpdateQRCodeRequestData, RotateLinkRequestData } from "../../dto-service/modules.export";
import {
  createQRCode,
  getQRCodeById,
  getQRCodeBySlug,
  getQRCodesByUserId,
  updateQRCode,
  deleteQRCode,
  getQRCodeByIdAndUserId,
} from "../../persistence-service/qrcode/modules.export";
import { AppError } from "../../helper-service/AppError";

// Generate unique slug
const generateUniqueSlug = (): string => {
  return nanoid(10);
};

export const createQRCodeService = async (
  data: CreateQRCodeRequestData,
  userId: string
) => {
  const slug = generateUniqueSlug();
  const qrcodeData = {
    ...data,
    slug,
    userId,
  };

  return await createQRCode(qrcodeData);
};

export const getQRCodeByIdService = async (qrcodeId: string) => {
  const qrcode = await getQRCodeById(qrcodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }
  return qrcode;
};

export const getQRCodeBySlugService = async (slug: string) => {
  const qrcode = await getQRCodeBySlug(slug);
  if (!qrcode || !qrcode.isActive) {
    throw new AppError("QR Code not found or inactive", 404);
  }
  
  // Check expiry
  if (qrcode.expiresAt && new Date(qrcode.expiresAt) < new Date()) {
    throw new AppError("QR Code has expired", 410);
  }

  return qrcode;
};

export const getQRCodesByUserIdService = async (userId: string) => {
  return await getQRCodesByUserId(userId);
};

export const updateQRCodeService = async (
  qrcodeId: string,
  userId: string,
  data: UpdateQRCodeRequestData
) => {
  const qrcode = await getQRCodeByIdAndUserId(qrcodeId, userId);
  if (!qrcode) {
    throw new AppError("QR Code not found or unauthorized", 404);
  }

  return await updateQRCode(qrcodeId, data);
};

export const rotateLinkService = async (
  qrcodeId: string,
  userId: string,
  data: RotateLinkRequestData
) => {
  const qrcode = await getQRCodeByIdAndUserId(qrcodeId, userId);
  if (!qrcode) {
    throw new AppError("QR Code not found or unauthorized", 404);
  }

  return await updateQRCode(qrcodeId, { destinationUrl: data.destinationUrl });
};

export const disableQRCodeService = async (qrcodeId: string, userId: string) => {
  const qrcode = await getQRCodeByIdAndUserId(qrcodeId, userId);
  if (!qrcode) {
    throw new AppError("QR Code not found or unauthorized", 404);
  }

  return await updateQRCode(qrcodeId, { isActive: false });
};

export const deleteQRCodeService = async (qrcodeId: string, userId: string) => {
  const qrcode = await getQRCodeByIdAndUserId(qrcodeId, userId);
  if (!qrcode) {
    throw new AppError("QR Code not found or unauthorized", 404);
  }

  await deleteQRCode(qrcodeId);
  return { message: "QR Code deleted successfully" };
};
