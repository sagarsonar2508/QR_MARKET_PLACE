import { QRCodeModel } from "./schemas/modules.export";
import type { QRCodeDetails } from "./schemas/modules.export";
import type { CreateQRCodeRequestData, UpdateQRCodeRequestData } from "../../dto-service/modules.export";

export const createQRCode = async (
  data: CreateQRCodeRequestData & { slug: string; userId: string }
): Promise<QRCodeDetails> => {
  const qrcode = new QRCodeModel(data);
  return await qrcode.save();
};

export const getQRCodeById = async (qrcodeId: string): Promise<QRCodeDetails | null> => {
  return await QRCodeModel.findById(qrcodeId);
};

export const getQRCodeBySlug = async (slug: string): Promise<QRCodeDetails | null> => {
  return await QRCodeModel.findOne({ slug });
};

export const getQRCodesByUserId = async (userId: string): Promise<QRCodeDetails[]> => {
  return await QRCodeModel.find({ userId });
};

export const updateQRCode = async (
  qrcodeId: string,
  data: UpdateQRCodeRequestData
): Promise<QRCodeDetails | null> => {
  return await QRCodeModel.findByIdAndUpdate(qrcodeId, data, { new: true });
};

export const deleteQRCode = async (qrcodeId: string): Promise<QRCodeDetails | null> => {
  return await QRCodeModel.findByIdAndDelete(qrcodeId);
};

export const incrementQRCodeScanCount = async (qrcodeId: string): Promise<QRCodeDetails | null> => {
  return await QRCodeModel.findByIdAndUpdate(
    qrcodeId,
    { $inc: { scanCount: 1 } },
    { new: true }
  );
};

export const getQRCodeByIdAndUserId = async (
  qrcodeId: string,
  userId: string
): Promise<QRCodeDetails | null> => {
  return await QRCodeModel.findOne({ _id: qrcodeId, userId });
};
