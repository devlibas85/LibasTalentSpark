import crypto from "crypto";

import { env } from "./env.js";
import {
  GraphToken,
  GRAPH_TOKEN_ID,
} from "../database/models/graphToken.Models.js";

/**
 * Storage for the Graph mail refresh token.
 *
 * The refresh token is a long-lived credential that can send mail as the
 * service account, so it never touches the database in plaintext. TOKEN_ENC_KEY
 * (any passphrase) is hashed to a 32-byte AES key; each record carries its own
 * random IV and GCM auth tag, so tampering fails loudly rather than silently
 * decrypting to garbage.
 */

const ALGO = "aes-256-gcm";

function key(): Buffer {
  if (!env.tokenEncKey) {
    throw new Error(
      "TOKEN_ENC_KEY is required in delegated Graph mode (it encrypts the stored refresh token).",
    );
  }
  return crypto.createHash("sha256").update(env.tokenEncKey).digest();
}

function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  // iv.tag.ciphertext — self-describing, so rotation only needs the key.
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    body.toString("base64url"),
  ].join(".");
}

function decrypt(stored: string): string {
  const [ivB64, tagB64, bodyB64] = stored.split(".");

  if (!ivB64 || !tagB64 || !bodyB64) {
    throw new Error("Stored Graph token is malformed — re-run graph:connect.");
  }

  const decipher = crypto.createDecipheriv(
    ALGO,
    key(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(bodyB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export interface StoredGraphToken {
  account: string;
  refreshToken: string;
  scope: string;
}

export async function saveGraphToken(
  account: string,
  refreshToken: string,
  scope: string,
): Promise<void> {
  await GraphToken.findByIdAndUpdate(
    GRAPH_TOKEN_ID,
    { account, refreshTokenEnc: encrypt(refreshToken), scope },
    { upsert: true },
  );
}

export async function getGraphToken(): Promise<StoredGraphToken | null> {
  const doc = await GraphToken.findById(GRAPH_TOKEN_ID);

  if (!doc) {
    return null;
  }

  return {
    account: doc.account,
    refreshToken: decrypt(doc.refreshTokenEnc),
    scope: doc.scope,
  };
}
