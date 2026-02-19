import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  azureClientId: required("AZURE_CLIENT_ID"),
  azureTenantId: required("AZURE_TENANT_ID"),
  azureClientSecret: required("AZURE_CLIENT_SECRET"),
  jwtSecret: required("JWT_SECRET"),
  frontendUrl: required("FRONTEND_URL"),
  mongoUri: required("MONGO_URI"),
  backendUrl: required("BACKEND_URL"),
};
