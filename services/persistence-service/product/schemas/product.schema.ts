import { Schema, model } from "mongoose";

export interface ProductDetails {
  _id?: string;
  name: string;
  basePrice: number;
  printProviderId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDetails>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    printProviderId: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ isActive: 1 });

export const ProductModel = model<ProductDetails>("Product", productSchema);
