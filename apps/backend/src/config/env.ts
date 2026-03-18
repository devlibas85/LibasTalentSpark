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
  nodeEnv: process.env.NODE_ENV || "development",

  // Azure SSO
  azureClientId: required("AZURE_CLIENT_ID"),
  azureTenantId: required("AZURE_TENANT_ID"),
  azureClientSecret: required("AZURE_CLIENT_SECRET"),

  // Microsoft Graph Email
  tenantId: required("TENANT_ID"),
  clientId: required("CLIENT_ID"),
  clientSecret: required("CLIENT_SECRET"),
  emailSender: required("EMAIL_SENDER"),

  // Auth
  jwtSecret: required("JWT_SECRET"),

  // URLs
  frontendUrl: required("FRONTEND_URL"),
  backendUrl: required("BACKEND_URL"),

  // Database
  mongoUri: required("MONGO_URI"),

  // SMTP (fallback)
  smtpUser: required("SMTP_USER"),
  smtpPass: required("SMTP_PASS"),

  // AI service
  aiServiceUrl: required("AI_SERVICE_URL"),
};
