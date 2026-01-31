import { nanoid } from "nanoid";
import type { CreateQRCodeRequestData, UpdateQRCodeRequestData, RotateLinkRequestData } from "../../dto-service/modules.export";
import {
  createQRCode,
  getQRCodeById,
  getQRCodeBySlug,
  getQRCodesByCafeId,
  updateQRCode,
  deleteQRCode,
  getQRCodeByIdAndCafeId,
} from "../../persistence-service/qrcode/modules.export";
import { getCafeById } from "../../persistence-service/cafe/modules.export";
import { AppError } from "../../helper-service/AppError";

// Generate unique slug
const generateUniqueSlug = (): string => {
  return nanoid(10);
};

export const createQRCodeService = async (
  data: CreateQRCodeRequestData,
  userId: string
) => {
  // Verify cafe exists and belongs to user
  const cafe = await getCafeById(data.cafeId);
  if (!cafe) {
    throw new AppError("Cafe not found", 404);
  }
  if (cafe.ownerId !== userId) {
    throw new AppError("Unauthorized to create QR code for this cafe", 403);
  }

  const slug = generateUniqueSlug();
  const qrcodeData = {
    ...data,
    slug,
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

export const getQRCodesByCafeIdService = async (cafeId: string, userId: string) => {
  const cafe = await getCafeById(cafeId);
  if (!cafe) {
    throw new AppError("Cafe not found", 404);
  }
  if (cafe.ownerId !== userId) {
    throw new AppError("Unauthorized to view QR codes for this cafe", 403);
  }

  return await getQRCodesByCafeId(cafeId);
};

export const updateQRCodeService = async (
  qrcodeId: string,
  userId: string,
  data: UpdateQRCodeRequestData
) => {
  const qrcode = await getQRCodeById(qrcodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  const cafe = await getCafeById(qrcode.cafeId);
  if (!cafe || cafe.ownerId !== userId) {
    throw new AppError("Unauthorized to update this QR code", 403);
  }

  return await updateQRCode(qrcodeId, data);
};

export const rotateLinkService = async (
  qrcodeId: string,
  userId: string,
  data: RotateLinkRequestData
) => {
  const qrcode = await getQRCodeById(qrcodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  const cafe = await getCafeById(qrcode.cafeId);
  if (!cafe || cafe.ownerId !== userId) {
    throw new AppError("Unauthorized to rotate link for this QR code", 403);
  }

  return await updateQRCode(qrcodeId, { destinationUrl: data.destinationUrl });
};

export const disableQRCodeService = async (qrcodeId: string, userId: string) => {
  const qrcode = await getQRCodeById(qrcodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  const cafe = await getCafeById(qrcode.cafeId);
  if (!cafe || cafe.ownerId !== userId) {
    throw new AppError("Unauthorized to disable this QR code", 403);
  }

  return await updateQRCode(qrcodeId, { isActive: false });
};

export const deleteQRCodeService = async (qrcodeId: string, userId: string) => {
  const qrcode = await getQRCodeById(qrcodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  const cafe = await getCafeById(qrcode.cafeId);
  if (!cafe || cafe.ownerId !== userId) {
    throw new AppError("Unauthorized to delete this QR code", 403);
  }

  await deleteQRCode(qrcodeId);
  return { message: "QR Code deleted successfully" };
};
