import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Could not load .env from:", envPath);
  throw new Error("Failed to load environment variables");
}



export const env = {
  port: Number(process.env.PORT) || 4001,
  azureClientId: process.env.AZURE_CLIENT_ID!,
  azureTenantId: process.env.AZURE_TENANT_ID!,
  azureClientSecret: process.env.AZURE_CLIENT_SECRET!,
  jwtSecret: process.env.JWT_SECRET!,
  frontendUrl: process.env.FRONTEND_URL!,
   mongoUri: process.env.MONGO_URI!,
   backedUrl:process.env.BACKEND_URL!,
};

// Validate required vars
if (!env.azureClientId || !env.azureTenantId || !env.azureClientSecret || !env.jwtSecret ||   !env.mongoUri) {
  console.error("❌ Missing required environment variables in .env file");
  console.error("Please check your .env file at:", envPath);
  throw new Error("Missing required environment variables");
}

console.log("✅ All environment variables validated");