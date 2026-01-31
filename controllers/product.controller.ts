import type { Request, Response } from "express";
import {
  createProductService,
  getProductByIdService,
  getAllProductsService,
  updateProductService,
  deleteProductService,
} from "../services/business-service/product/modules.export";
import { catchAsync, sendResponse } from "../services/helper-service/modules.export";
import { HttpStatusCode } from "../services/dto-service/modules.export";
import type { AuthRequest } from "../middlewares/authenticate";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const response = await createProductService(req.body);
  sendResponse(res, {
    status: HttpStatusCode.CREATED,
    data: response,
    message: "Product created successfully",
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const response = await getProductByIdService(req.params.id as string);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Product retrieved successfully",
  });
});

// Public endpoint - get all products with shirt designs
export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const response = await getAllProductsService();
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Products retrieved successfully",
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const response = await updateProductService(req.params.id as string, req.body);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Product updated successfully",
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const response = await deleteProductService(req.params.id as string);
  sendResponse(res, {
    status: HttpStatusCode.OK,
    data: response,
    message: "Product deleted successfully",
  });
});
