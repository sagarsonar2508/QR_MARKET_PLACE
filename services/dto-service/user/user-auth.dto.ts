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

export interface VerifyEmailRequestData {
  token: string;
  email: string;
}

export interface SetPasswordRequestData {
  email: string;
  password: string;
  confirmPassword: string;
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