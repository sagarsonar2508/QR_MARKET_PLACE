import type { CafeStatus } from "./cafe.enum";

export interface CreateCafeRequestData {
  name: string;
  address: string;
  city: string;
  googleReviewLink?: string;
}

export interface UpdateCafeRequestData {
  name?: string;
  address?: string;
  city?: string;
  googleReviewLink?: string;
  status?: CafeStatus;
}

export interface CafeResponseData {
  _id: string;
  ownerId: string;
  name: string;
  address: string;
  city: string;
  googleReviewLink?: string;
  status: CafeStatus;
  createdAt: Date;
  updatedAt: Date;
}
