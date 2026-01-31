import { CafeModel } from "./schemas/modules.export";
import type { CafeDetails } from "./schemas/modules.export";
import type { CreateCafeRequestData, UpdateCafeRequestData } from "../../dto-service/modules.export";

export const createCafe = async (
  data: CreateCafeRequestData & { ownerId: string }
): Promise<CafeDetails> => {
  const cafe = new CafeModel(data);
  return await cafe.save();
};

export const getCafeById = async (cafeId: string): Promise<CafeDetails | null> => {
  return await CafeModel.findById(cafeId);
};

export const getCafesByOwnerId = async (ownerId: string): Promise<CafeDetails[]> => {
  return await CafeModel.find({ ownerId });
};

export const getAllCafes = async (): Promise<CafeDetails[]> => {
  return await CafeModel.find();
};

export const getCafesByCity = async (city: string): Promise<CafeDetails[]> => {
  return await CafeModel.find({ city: city.toLowerCase() });
};

export const updateCafe = async (
  cafeId: string,
  data: UpdateCafeRequestData
): Promise<CafeDetails | null> => {
  return await CafeModel.findByIdAndUpdate(cafeId, data, { new: true });
};

export const deleteCafe = async (cafeId: string): Promise<CafeDetails | null> => {
  return await CafeModel.findByIdAndDelete(cafeId);
};

export const getCafeByIdAndOwnerId = async (
  cafeId: string,
  ownerId: string
): Promise<CafeDetails | null> => {
  return await CafeModel.findOne({ _id: cafeId, ownerId });
};
