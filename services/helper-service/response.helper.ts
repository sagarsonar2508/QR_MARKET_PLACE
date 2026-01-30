import type { Response } from "express";
import { HttpStatusCode } from "../dto-service/constants/modules.export";

interface SendResponseOptions {
  status?: HttpStatusCode;
  data?: unknown;
  code?: number;
  message: string;
}

/**
 * Send a standardized JSON response
 */
export const sendResponse = (
  res: Response,
  { status = HttpStatusCode.OK, data = {}, code = 0, message }: SendResponseOptions
): void => {
  res.status(status).json({
    data,
    error: { code, message },
  });
};
