import type { Request, Response } from "express";
import {
  createOrderService,
  getOrderByIdService,
  getUserOrdersService,
} from "../services/business-service/order/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";
import type { AuthRequest } from "../middlewares/authenticate";

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await createOrderService(req.body, userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.CREATED,
    data: response,
    message: "Order created successfully",
  });
});

export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await getOrderByIdService(req.params.id as string, userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Order retrieved successfully",
  });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.session?.userId;
  
  if (!userId) {
    throw new Error("User ID not found in session");
  }

  const response = await getUserOrdersService(userId.toString());
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Orders retrieved successfully",
  });
});
