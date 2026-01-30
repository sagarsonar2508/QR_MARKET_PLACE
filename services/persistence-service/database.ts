import mongoose from "mongoose";
import { config } from "dotenv";

config();

// Validate required env variables
const requiredEnv = ["MONGODB_URI"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

export { mongoose };
