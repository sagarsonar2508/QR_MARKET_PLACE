import { Router } from "express";
import {
  getQRCodeAnalytics,
  getQRCodeStats,
} from "../controllers/analytics.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

router.get("/qrcode/:qrCodeId", getQRCodeAnalytics);
router.get("/stats/qrcode/:qrCodeId", getQRCodeStats);

export default router;
