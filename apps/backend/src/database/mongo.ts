import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectMongo = async () => {
  try {
    console.log("Mongo URI used:", env.mongoUri);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
    });
    console.log("✅ MONGODB CONNECTED");
    console.log("Connected to database:", mongoose.connection.name);
  } catch (error:any) {
    console.error("❌ MONGO connection failed:", error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error("💡 This usually means:");
      console.error("   1. Your IP is not whitelisted in MongoDB Atlas");
      console.error("   2. Check Network Access settings in Atlas");
    }
    
    process.exit(1);
  }
};