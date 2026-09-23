import crypto from "crypto";
import http from "http";
import { exec } from "child_process";
import mongoose from "mongoose";

import { env } from "../config/env.js";
import { connectDB } from "../database/index.js";
import { DELEGATED_SCOPES, tokenUrl } from "../config/sendEmail.js";
import { saveGraphToken } from "../config/graphToken.repository.js";

/**
 * One-time consent capture for delegated Graph mail:  npm run graph:connect
 *
 * Opens the Microsoft sign-in page, catches the authorization code on a
 * loopback listener, exchanges it for a refresh token and stores that token
 * encrypted. Run this once per environment — and again only if the token is
 * revoked (mailbox password reset) or goes 90 days unused.
 *
 * REQUIREMENTS on the app registration (ab0902fe…):
 *   - Redirect URI (Web):  http://localhost:53682/callback
 *   - Delegated permissions: Mail.Send, offline_access  (neither needs admin consent)
 *
 * Sign in as EMAIL_SENDER — delegated tokens can only send as the account that
 * consented, so signing in as anyone else silently gives you the wrong sender.
 */

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GraphMe {
  mail?: string;
  userPrincipalName?: string;
}

function authorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.azureClientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    response_mode: "query",
    scope: DELEGATED_SCOPES.join(" "),
    state,
    // Always show the account picker: the default silent sign-in would
    // quietly reuse whatever session the browser already has.
    prompt: "select_account",
    login_hint: env.emailSender,
  });

  return `https://login.microsoftonline.com/${env.azureTenantId}/oauth2/v2.0/authorize?${params}`;
}

/** Wait for Microsoft to redirect back, and hand over the code. */
function awaitCode(expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

      if (url.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }

      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");
      const state = url.searchParams.get("state");

      const finish = (message: string) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<html><body style="font-family:system-ui;padding:3rem">
          <h2>${message}</h2><p>You can close this tab and return to the terminal.</p>
        </body></html>`);
        server.close();
      };

      if (error) {
        finish("Sign-in failed.");
        reject(new Error(error));
        return;
      }

      // Guards against a stray/replayed redirect landing on this listener.
      if (state !== expectedState) {
        finish("Sign-in failed.");
        reject(new Error("State mismatch — aborted."));
        return;
      }

      if (!code) {
        finish("Sign-in failed.");
        reject(new Error("No authorization code in the callback."));
        return;
      }

      finish("Connected.");
      resolve(code);
    });

    server.on("error", reject);
    server.listen(PORT);
  });
}

async function exchangeCode(code: string): Promise<TokenResponse> {
  const res = await fetch(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.azureClientId,
      client_secret: env.azureClientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      scope: DELEGATED_SCOPES.join(" "),
    }),
  });

  const json = (await res.json()) as TokenResponse;

  if (!res.ok || !json.access_token) {
    throw new Error(
      json.error_description?.split("Trace ID")[0]?.trim() ??
        json.error ??
        "Token exchange failed",
    );
  }

  return json;
}

async function whoAmI(accessToken: string): Promise<string> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Could not read the signed-in account: ${await res.text()}`);
  }

  const me = (await res.json()) as GraphMe;
  const account = me.mail ?? me.userPrincipalName;

  if (!account) {
    throw new Error("Graph returned no address for the signed-in account.");
  }

  return account;
}

async function main(): Promise<void> {
  console.log("Connecting Microsoft Graph mail\n");
  console.log("  tenant       :", env.azureTenantId);
  console.log("  client       :", env.azureClientId);
  console.log("  redirect URI :", REDIRECT_URI);
  console.log("  scopes       :", DELEGATED_SCOPES.join(" "));
  console.log("  sign in as   :", env.emailSender, "\n");

  if (!env.tokenEncKey) {
    throw new Error("TOKEN_ENC_KEY must be set before connecting (it encrypts the stored token).");
  }

  await connectDB();

  const state = crypto.randomBytes(16).toString("hex");
  const url = authorizeUrl(state);
  const pending = awaitCode(state);

  console.log("Opening the browser. If nothing opens, paste this URL:\n");
  console.log(url, "\n");
  // `start` needs the empty "" title argument, else a quoted URL becomes the title.
  exec(`start "" "${url}"`, { shell: "cmd.exe" }, () => {
    /* a failed launch is fine — the URL is printed above */
  });

  const code = await pending;
  const tokens = await exchangeCode(code);

  if (!tokens.refresh_token) {
    throw new Error(
      "No refresh token returned — add the `offline_access` delegated permission to the app registration.",
    );
  }

  const account = await whoAmI(tokens.access_token);
  const granted = tokens.scope ?? "";

  if (!/\bMail\.Send\b/i.test(granted)) {
    throw new Error(
      `Mail.Send was not granted (got: ${granted || "nothing"}). Add it as a DELEGATED permission on the app registration and retry.`,
    );
  }

  await saveGraphToken(account, tokens.refresh_token, granted);

  console.log("✅ Stored the mail token.");
  console.log("   sending as :", account);
  console.log("   scopes     :", granted);

  if (account.toLowerCase() !== env.emailSender.toLowerCase()) {
    console.warn(
      `\n⚠️  You signed in as ${account}, but EMAIL_SENDER is ${env.emailSender}.`,
    );
    console.warn(
      "   Delegated mail sends as the signed-in account, so OTPs will come from",
      `${account}.`,
    );
    console.warn("   Re-run this and pick the right account, or update EMAIL_SENDER to match.");
  }

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch(async (err: Error) => {
    console.error("\n❌ graph:connect failed:", err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
