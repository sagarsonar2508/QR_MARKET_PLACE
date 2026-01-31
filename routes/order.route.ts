import { Router } from "express";
import {
  createOrder,
  getOrder,
  getMyOrders,
} from "../controllers/order.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { createOrderSchema } from "../middlewares/order/modules.export";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", validateRequest(createOrderSchema), createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrder);

export default router;
