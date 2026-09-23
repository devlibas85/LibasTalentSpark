import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

/**
 * There is exactly ONE .env in this repo, at the repo root, shared by the
 * backend, the frontend (via vite's envDir) and docker compose (env_file).
 *
 * dotenv's default only looks in process.cwd(), which differs between `npm run
 * dev` from apps/backend, `node dist/server.js` in the container, and the ops
 * scripts. So walk up from this file until the root .env is found. In Docker
 * the values arrive via env_file and nothing is found on disk — that is fine,
 * because dotenv never overwrites a variable that is already set.
 */
function loadEnvFile(): void {
  let dir = path.dirname(fileURLToPath(import.meta.url));

  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, ".env");

    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Nothing on disk: rely on real environment variables (container, CI).
  dotenv.config();
}

loadEnvFile();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Session
  sessionSecret: required("SESSION_SECRET"),

  /* ───── AZURE APP REGISTRATION ─────
   * One registration serves BOTH Microsoft SSO and Graph mail. This used to be
   * two trios (AZURE_* and TENANT_ID/CLIENT_ID/CLIENT_SECRET) holding what was
   * meant to be the same app — they drifted, and SSO ended up pointing at a
   * deleted registration. One source of truth prevents that. */
  azureTenantId: required("AZURE_TENANT_ID"),
  azureClientId: required("AZURE_CLIENT_ID"),
  azureClientSecret: required("AZURE_CLIENT_SECRET"),

  // Microsoft Graph Email — the mailbox OTP mail is sent from.
  emailSender: required("EMAIL_SENDER"),

  // How the Graph mail token is obtained. "delegated" sends as the signed-in
  // mailbox using a stored refresh token and needs no admin consent;
  // "app-only" uses client credentials and needs the Mail.Send APPLICATION
  // permission granted on the app registration.
  graphAuthMode:
    optional("GRAPH_AUTH_MODE") === "app-only" ? "app-only" : "delegated",
  // Encrypts the stored Graph refresh token. Required in delegated mode.
  tokenEncKey: optional("TOKEN_ENC_KEY"),

  // Auth
  jwtSecret: required("JWT_SECRET"),

  // URLs
  frontendUrl: required("FRONTEND_URL"),
  backendUrl: required("BACKEND_URL"),

  // Database
  mongoUri: required("MONGO_URI"),

  // AI service
  aiServiceUrl: required("AI_SERVICE_URL"),
};
