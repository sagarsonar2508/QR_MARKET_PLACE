import type { Platform } from "../constants/modules.export";

export interface LoginUserRequestData {
  email: string;
  password: string;
  platform: Platform;
}

export interface LoginResponse {
  email: string;
  role: string | null;
  expiresIn: number;
  token: string;
}

export const AccessTokenExpiry = "3h";
export const AccessTokenExpiryInSeconds = 3 * 60 * 60;

export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}