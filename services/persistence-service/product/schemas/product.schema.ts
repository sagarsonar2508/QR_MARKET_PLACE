import { Schema, model } from "mongoose";

export interface ShirtDesign {
  colorCode: string;
  colorName: string;
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  mockupImageUrl: string; // Image showing shirt with design
  quantity?: number;
}

export interface ProductDetails {
  _id?: string;
  name: string;
  description?: string;
  basePrice: number;
  printProviderId: string;
  productType: "shirt" | "other"; // New field to distinguish product types
  shirtDesigns: ShirtDesign[]; // Array of available shirt designs with QR
  thumbnailUrl?: string; // Main product image
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
    description: {
      type: String,
      default: "",
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
    productType: {
      type: String,
      enum: ["shirt", "other"],
      default: "shirt",
    },
    shirtDesigns: [
      {
        colorCode: {
          type: String,
          required: true,
        },
        colorName: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
          required: true,
        },
        mockupImageUrl: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    thumbnailUrl: {
      type: String,
      default: "",
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
productSchema.index({ productType: 1 });

export const ProductModel = model<ProductDetails>("Product", productSchema);
