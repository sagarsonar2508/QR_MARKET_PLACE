import { ProductModel } from "./schemas/modules.export";
import type { ProductDetails } from "./schemas/modules.export";
import type { CreateProductRequestData, UpdateProductRequestData } from "../../dto-service/modules.export";

export const createProduct = async (data: CreateProductRequestData): Promise<ProductDetails> => {
  const product = new ProductModel(data);
  return await product.save();
};

export const getProductById = async (productId: string): Promise<ProductDetails | null> => {
  return await ProductModel.findById(productId);
};

export const getAllProducts = async (): Promise<ProductDetails[]> => {
  return await ProductModel.find({ isActive: true });
};

export const getAllProductsIncludeInactive = async (): Promise<ProductDetails[]> => {
  return await ProductModel.find();
};

export const updateProduct = async (
  productId: string,
  data: UpdateProductRequestData
): Promise<ProductDetails | null> => {
  return await ProductModel.findByIdAndUpdate(productId, data, { new: true });
};

export const deleteProduct = async (productId: string): Promise<ProductDetails | null> => {
  return await ProductModel.findByIdAndDelete(productId);
};
