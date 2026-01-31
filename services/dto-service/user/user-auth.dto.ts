import type { Platform } from "../constants/modules.export";

export interface LoginUserRequestData {
  email: string;
  password: string;
  platform: Platform;
}

export interface EmailSignupRequestData {
  email: string;
  firstName: string;
  lastName: string;
  platform: Platform;
}

export interface GoogleSignupRequestData {
  googleToken: string;
  firstName: string;
  lastName: string;
  platform: Platform;
}

export interface VerifyOtpRequestData {
  email: string;
  otp: string;
  platform: Platform;
}

export interface SetPasswordRequestData {
  email: string;
  password: string;
  confirmPassword: string;
  platform: Platform;
}

export interface LoginResponse {
  email: string;
  role: string | null;
  expiresIn: number;
  token: string;
}

export interface OtpResponse {
  message: string;
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