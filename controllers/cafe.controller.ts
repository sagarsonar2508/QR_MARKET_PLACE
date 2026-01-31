import type { Request, Response } from "express";
import {
  createCafeService,
  getCafeByIdService,
  getCafesByOwnerIdService,
  updateCafeService,
  deleteCafeService,
} from "../services/business-service/cafe/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";

export const createCafe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await createCafeService(req.body, userId);
  sendResponse(res, {
    status: HttpStatusCode.CREATED,
    data: response,
    message: "Cafe created successfully",
  });
});

export const getCafe = catchAsync(async (req: Request, res: Response) => {
  const response = await getCafeByIdService(req.params.id as string);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Cafe retrieved successfully",
  });
});

export const getMyCafes = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await getCafesByOwnerIdService(userId);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Cafes retrieved successfully",
  });
});

export const updateCafe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await updateCafeService(req.params.id as string, userId, req.body);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Cafe updated successfully",
  });
});

export const deleteCafe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await deleteCafeService(req.params.id as string, userId);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Cafe deleted successfully",
  });
});
