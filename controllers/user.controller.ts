import type { Request, Response } from "express";
import { emailSignupService, googleSignupService, verifyEmailService, setPasswordService, loginService } from "../services/business-service/user/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { ResponseMessages } from "../services/dto-service/constants/response-messages";
import { HttpStatusCode } from "../services/dto-service/modules.export";

export const emailSignup = catchAsync(async (req: Request, res: Response) => {
  const response = await emailSignupService(req.body);
  sendResponse(res, { status: HttpStatusCode.CREATED, data: response, message: "Signup successful" });
});

export const googleSignup = catchAsync(async (req: Request, res: Response) => {
  const response = await googleSignupService(req.body);
  sendResponse(res, { status: HttpStatusCode.CREATED, data: response, message: "Google signup successful" });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const response = await verifyEmailService(req.body);
  sendResponse(res, { status: HttpStatusCode.OK, data: response, message: response.message });
});

export const setPassword = catchAsync(async (req: Request, res: Response) => {
  const response = await setPasswordService(req.body);
  sendResponse(res, { status: HttpStatusCode.OK, data: response, message: response.message });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const response = await loginService(req.body);
  sendResponse(res, { status: HttpStatusCode.OK, data: response, message: "Login successful" });
});
