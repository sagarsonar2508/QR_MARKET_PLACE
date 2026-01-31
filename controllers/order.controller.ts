import type { Request, Response } from "express";
import {
  createOrderService,
  getOrderByIdService,
  getUserOrdersService,
} from "../services/business-service/order/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await createOrderService(req.body, userId);
  sendResponse(res, {
    status: HttpStatusCode.CREATED,
    data: response,
    message: "Order created successfully",
  });
});

export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await getOrderByIdService(req.params.id as string, userId);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Order retrieved successfully",
  });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const response = await getUserOrdersService(userId);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Orders retrieved successfully",
  });
});
