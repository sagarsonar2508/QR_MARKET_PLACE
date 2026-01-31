import type { CreateProductRequestData, UpdateProductRequestData } from "../../dto-service/modules.export";
import {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../../persistence-service/product/modules.export";
import { AppError } from "../../helper-service/AppError";

export const createProductService = async (data: CreateProductRequestData) => {
  return await createProduct(data);
};

export const getProductByIdService = async (productId: string) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};

export const getAllProductsService = async () => {
  return await getAllProducts();
};

export const updateProductService = async (
  productId: string,
  data: UpdateProductRequestData
) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return await updateProduct(productId, data);
};

export const deleteProductService = async (productId: string) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await deleteProduct(productId);
  return { message: "Product deleted successfully" };
};
