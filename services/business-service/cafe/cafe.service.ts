import type { CreateCafeRequestData, UpdateCafeRequestData } from "../../dto-service/modules.export";
import { CafeStatus } from "../../dto-service/modules.export";
import {
  createCafe,
  getCafeById,
  getCafesByOwnerId,
  getAllCafes,
  getCafesByCity,
  updateCafe,
  deleteCafe,
} from "../../persistence-service/cafe/modules.export";
import { AppError } from "../../helper-service/AppError";
import { ErrorMessages } from "../../dto-service/constants/modules.export";

export const createCafeService = async (
  data: CreateCafeRequestData,
  ownerId: string
) => {
  const cafeData = {
    ...data,
    ownerId,
    status: CafeStatus.ACTIVE,
  };
  return await createCafe(cafeData);
};

export const getCafeByIdService = async (cafeId: string) => {
  const cafe = await getCafeById(cafeId);
  if (!cafe) {
    throw new AppError("Cafe not found", 404);
  }
  return cafe;
};

export const getCafesByOwnerIdService = async (ownerId: string) => {
  return await getCafesByOwnerId(ownerId);
};

export const getAllCafesService = async () => {
  return await getAllCafes();
};

export const getCafesByCityService = async (city: string) => {
  return await getCafesByCity(city);
};

export const updateCafeService = async (
  cafeId: string,
  ownerId: string,
  data: UpdateCafeRequestData
) => {
  // Verify ownership
  const cafe = await getCafeById(cafeId);
  if (!cafe) {
    throw new AppError("Cafe not found", 404);
  }
  if (cafe.ownerId !== ownerId) {
    throw new AppError("Unauthorized to update this cafe", 403);
  }

  const updatedCafe = await updateCafe(cafeId, data);
  return updatedCafe;
};

export const deleteCafeService = async (cafeId: string, ownerId: string) => {
  const cafe = await getCafeById(cafeId);
  if (!cafe) {
    throw new AppError("Cafe not found", 404);
  }
  if (cafe.ownerId !== ownerId) {
    throw new AppError("Unauthorized to delete this cafe", 403);
  }

  await deleteCafe(cafeId);
  return { message: "Cafe deleted successfully" };
};
