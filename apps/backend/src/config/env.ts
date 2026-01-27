import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ now this works in ESM
dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4001),
  mongoUri: process.env.MONGO_URI as string,
};
