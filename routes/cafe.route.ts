import { Router } from "express";
import {
  createCafe,
  getCafe,
  getMyCafes,
  updateCafe,
  deleteCafe,
} from "../controllers/cafe.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { createCafeSchema, updateCafeSchema } from "../middlewares/cafe/modules.export";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// All cafe routes require authentication
router.use(authenticate);

router.post("/", validateRequest(createCafeSchema), createCafe);
router.get("/my-cafes", getMyCafes);
router.get("/:id", getCafe);
router.put("/:id", validateRequest(updateCafeSchema), updateCafe);
router.delete("/:id", deleteCafe);

export default router;
