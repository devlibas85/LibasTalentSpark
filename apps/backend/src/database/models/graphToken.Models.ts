import mongoose, { Schema, type Document } from "mongoose";

/* ────────────────────────────────────────────── */
/* Types */
/* ────────────────────────────────────────────── */

/**
 * The Microsoft Graph refresh token for the mail service account, captured
 * once by `npm run graph:connect`. Exactly one document ever exists (pinned to
 * a fixed _id) — it is the app's single mail identity, not per-user data.
 *
 * The refresh token is stored ENCRYPTED; see graphToken.repository.ts.
 */
export interface GraphTokenSchemaType {
  _id: string;
  /** Mailbox that signed in — OTP mail is sent as this address. */
  account: string;
  /** AES-256-GCM ciphertext of the refresh token (never the plaintext). */
  refreshTokenEnc: string;
  /** Scopes the token was granted, for diagnostics. */
  scope: string;
}

export interface GraphTokenDocument extends GraphTokenSchemaType, Document<string> {
  createdAt: Date;
  updatedAt: Date;
}

/* ────────────────────────────────────────────── */
/* Schema */
/* ────────────────────────────────────────────── */

const graphTokenSchema = new Schema<GraphTokenDocument>(
  {
    _id: { type: String, default: "graph-mail" },
    account: { type: String, required: true },
    refreshTokenEnc: { type: String, required: true },
    scope: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ────────────────────────────────────────────── */

export const GraphToken = mongoose.model<GraphTokenDocument>(
  "GraphToken",
  graphTokenSchema,
);

/** The single document's fixed key. */
export const GRAPH_TOKEN_ID = "graph-mail";
