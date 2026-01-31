import type { QRCodeType } from "./qrcode.enum";

export interface CreateQRCodeRequestData {
  type: QRCodeType;
  destinationUrl: string;
  expiresAt?: Date;
}

export interface UpdateQRCodeRequestData {
  destinationUrl?: string;
  isActive?: boolean;
  expiresAt?: Date;
}

export interface RotateLinkRequestData {
  destinationUrl: string;
}

export interface QRCodeResponseData {
  _id: string;
  userId: string;
  slug: string;
  type: QRCodeType;
  destinationUrl: string;
  isActive: boolean;
  expiresAt: Date | null;
  qrCodeImageUrl?: string;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}
