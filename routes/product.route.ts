import { Router } from "express";
import {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { createProductSchema, updateProductSchema } from "../middlewares/product/modules.export";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// Public endpoint - get all products
router.get("/", getAllProducts);
router.get("/:id", getProduct);

// Protected endpoints (admin only would be ideal, but we'll keep it simple for now)
router.post("/", authenticate, validateRequest(createProductSchema), createProduct);
router.put("/:id", authenticate, validateRequest(updateProductSchema), updateProduct);
router.delete("/:id", authenticate, deleteProduct);

export default router;
