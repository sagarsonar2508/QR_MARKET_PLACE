import dotenv from "dotenv";
import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/user.route";
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

app.use("/user", userRoutes);

app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).send(`Hoopr Sage ${process.env.NODE_ENV} Server is Healthy`);
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
