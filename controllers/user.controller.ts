import type { Request, Response } from "express";
import { userLoginService } from "../services/business-service/modules.export";
import { catchAsync, extractSessionMetadata, sendResponse } from "../services/helper-service/modules.export";
import { ResponseMessages } from "../services/dto-service/constants/response-messages";
import { HttpStatusCode } from "../services/dto-service/modules.export";

export const login = catchAsync(async (req: Request, res: Response) => {
  const metadata = extractSessionMetadata(req);
  const response = await userLoginService(req.body, metadata);
  sendResponse(res, { status: HttpStatusCode.OK, data: response, message: ResponseMessages.LoginSuccess });
});
