import fetch from "node-fetch";

import { env } from "./env.js";
import {
  getGraphToken,
  saveGraphToken,
} from "./graphToken.repository.js";

/**
 * Microsoft Graph mail sending, in one of two modes (GRAPH_AUTH_MODE):
 *
 *   delegated (default) — acts AS the mailbox in EMAIL_SENDER, redeeming a
 *     refresh token captured once by `npm run graph:connect`. Needs only
 *     user-consentable delegated scopes (Mail.Send, offline_access) — NO admin
 *     consent, which is why this is the default.
 *
 *   app-only — client-credentials flow. Simpler and has no token to maintain,
 *     but requires the Mail.Send APPLICATION permission to be granted with
 *     admin consent on the app registration.
 */

/** Delegated scopes requested by graph:connect and on every refresh. */
export const DELEGATED_SCOPES = [
  "offline_access",
  "Mail.Send",
  "User.Read",
] as const;

export function tokenUrl(): string {
  return `https://login.microsoftonline.com/${env.azureTenantId}/oauth2/v2.0/token`;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface TokenErrorResponse {
  error?: string;
  error_description?: string;
}

/** Strip the trace/correlation ids Azure appends, keeping the actual reason. */
function azureReason(body: string): string {
  try {
    const parsed = JSON.parse(body) as TokenErrorResponse;
    const detail = parsed.error_description ?? parsed.error ?? body;
    return detail.split(/\r?\nTrace ID|Trace ID/)[0]!.trim();
  } catch {
    return body;
  }
}

/* ────────────────────────────────────────────── */
/* Token acquisition */
/* ────────────────────────────────────────────── */

// Access tokens live ~1 h; cache in memory and refresh a minute early so a
// burst of OTP requests doesn't hammer the token endpoint.
let cached: { value: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

async function requestToken(
  body: URLSearchParams,
): Promise<TokenResponse> {
  const res = await fetch(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Graph token request failed: ${azureReason(text)}`);
  }

  return JSON.parse(text) as TokenResponse;
}

/** Client-credentials token — needs Mail.Send application permission. */
async function appOnlyToken(): Promise<TokenResponse> {
  return requestToken(
    new URLSearchParams({
      client_id: env.azureClientId,
      client_secret: env.azureClientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  );
}

/**
 * Redeem the stored refresh token. Azure rotates the refresh token on every
 * exchange, so the new one is persisted immediately — dropping it would strand
 * the mailbox and force another graph:connect.
 */
async function delegatedToken(): Promise<TokenResponse> {
  const stored = await getGraphToken();

  if (!stored) {
    throw new Error(
      `No Graph mail token stored — run \`npm run graph:connect\` and sign in as ${env.emailSender}.`,
    );
  }

  const body = new URLSearchParams({
    client_id: env.azureClientId,
    grant_type: "refresh_token",
    refresh_token: stored.refreshToken,
    scope: DELEGATED_SCOPES.join(" "),
  });

  // Web/confidential app registration: Azure requires the secret here too.
  if (env.azureClientSecret) {
    body.set("client_secret", env.azureClientSecret);
  }

  const json = await requestToken(body);

  if (json.refresh_token) {
    await saveGraphToken(
      stored.account,
      json.refresh_token,
      json.scope ?? stored.scope,
    );
  }

  return json;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (cached && cached.expiresAt > now + 60_000) {
    return cached.value;
  }

  // Collapse concurrent refreshes so the rotated refresh token isn't raced.
  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    const json =
      env.graphAuthMode === "app-only"
        ? await appOnlyToken()
        : await delegatedToken();

    cached = {
      value: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000,
    };

    return cached.value;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

/** Drop the cached access token — used after a 401 to force one retry. */
function invalidateToken(): void {
  cached = null;
}

/* ────────────────────────────────────────────── */
/* Sending */
/* ────────────────────────────────────────────── */

function sendMailUrl(): string {
  // Delegated tokens may only send as the signed-in mailbox, so /me is the
  // correct target; app-only tokens have no user context and must name one.
  return env.graphAuthMode === "app-only"
    ? `https://graph.microsoft.com/v1.0/users/${env.emailSender}/sendMail`
    : "https://graph.microsoft.com/v1.0/me/sendMail";
}

async function postSendMail(
  token: string,
  to: string,
  subject: string,
  html: string,
) {
  return fetch(sendMailUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: false,
    }),
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  let response = await postSendMail(await getAccessToken(), to, subject, html);

  // A cached token can be revoked mid-life (password reset, admin action).
  // One forced refresh distinguishes that from a genuine permission problem.
  if (response.status === 401) {
    invalidateToken();
    response = await postSendMail(await getAccessToken(), to, subject, html);
  }

  if (!response.ok) {
    const text = await response.text();

    if (response.status === 403) {
      throw new Error(
        `Graph refused the send (403). In ${env.graphAuthMode} mode this usually means the ` +
          (env.graphAuthMode === "app-only"
            ? "Mail.Send APPLICATION permission is not granted with admin consent."
            : "signed-in mailbox lacks Mail.Send, or graph:connect was run as a different account.") +
          ` Graph said: ${text}`,
      );
    }

    throw new Error(`Email send failed (${response.status}): ${text}`);
  }
}
