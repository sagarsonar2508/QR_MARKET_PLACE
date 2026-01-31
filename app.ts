import dotenv from "dotenv";
import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/user.route";
import qrcodeRoutes from "./routes/qrcode.route";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";
import paymentRoutes from "./routes/payment.route";
import analyticsRoutes from "./routes/analytics.route";
import webhookRoutes from "./routes/webhooks.route";
import { redirectQRCode } from "./controllers/qrcode.controller";
import { initializeBusinessService } from "./services/business-service/initialize.business.service";
import { errorHandler } from "./middlewares/errorHandler";
import { getCorsOptions } from "./services/helper-service/modules.export";

dotenv.config();

const app: Application = express();
app.use(express.json());

await initializeBusinessService();

const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Public QR redirect endpoint (must be before routes)
app.get("/q/:slug", redirectQRCode);

// Route handlers
app.use("/user", userRoutes);
app.use("/qrcodes", qrcodeRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/webhooks", webhookRoutes);

app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).send(`QR ${process.env.NODE_ENV} Server is Healthy`);
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
