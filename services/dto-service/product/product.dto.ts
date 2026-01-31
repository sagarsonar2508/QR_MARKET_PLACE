export interface CreateProductRequestData {
  name: string;
  basePrice: number;
  printProviderId: string;
  isActive?: boolean;
}

export interface UpdateProductRequestData {
  name?: string;
  basePrice?: number;
  printProviderId?: string;
  isActive?: boolean;
}

export interface ProductResponseData {
  _id: string;
  name: string;
  basePrice: number;
  printProviderId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
