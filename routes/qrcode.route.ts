import { Router } from "express";
import {
  createQRCode,
  getQRCode,
  getUserQRCodes,
  updateQRCode,
  rotateLink,
  disableQRCode,
  deleteQRCode,
  redirectQRCode,
} from "../controllers/qrcode.controller";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createQRCodeSchema,
  updateQRCodeSchema,
  rotateLinkSchema,
} from "../middlewares/qrcode/modules.export";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// Public endpoints
router.get("/:slug/scan", redirectQRCode);

// Protected endpoints
router.post("/", authenticate, validateRequest(createQRCodeSchema), createQRCode);
router.get("/", authenticate, getUserQRCodes);
router.get("/:id", authenticate, getQRCode);
router.put("/:id", authenticate, validateRequest(updateQRCodeSchema), updateQRCode);
router.post("/:id/rotate-link", authenticate, validateRequest(rotateLinkSchema), rotateLink);
router.post("/:id/disable", authenticate, disableQRCode);
router.delete("/:id", authenticate, deleteQRCode);

export default router;
