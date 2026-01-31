import type { CorsOptions } from "cors";

/**
 * Get CORS configuration based on environment and allowed origins
 */
export const getCorsOptions = (): CorsOptions => {
  const frontendUrl = process.env.FRONTEND_URL;
  
  const allowedOrigins: string[] = [
    frontendUrl,
    "http://localhost:3002",
    "http://localhost:3000",
  ].filter((origin): origin is string => Boolean(origin));

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  };
};
