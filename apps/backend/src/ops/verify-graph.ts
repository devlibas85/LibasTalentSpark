import mongoose from "mongoose";

import { env } from "../config/env.js";
import { connectDB } from "../database/index.js";
import { getGraphToken } from "../config/graphToken.repository.js";
import { sendEmail } from "../config/sendEmail.js";

/**
 * Credential check for OTP mail:  npm run verify:graph [recipient]
 *
 * Reports the resolved mail configuration and proves a token can be obtained,
 * WITHOUT sending anything — unless you pass a recipient, in which case it
 * sends one test message so you can confirm the sender address end to end.
 */
async function main(): Promise<void> {
  const recipient = process.argv[2];

  console.log("Checking Microsoft Graph mail configuration…\n");
  console.log("  GRAPH_AUTH_MODE :", env.graphAuthMode);
  console.log("  AZURE_TENANT_ID :", env.azureTenantId);
  console.log("  AZURE_CLIENT_ID :", env.azureClientId);
  console.log("  AZURE_CLIENT_SEC:", env.azureClientSecret ? "set" : "MISSING");
  console.log("  EMAIL_SENDER    :", env.emailSender);
  console.log("  TOKEN_ENC_KEY   :", env.tokenEncKey ? "set" : "MISSING");
  console.log();

  await connectDB();

  if (env.graphAuthMode === "delegated") {
    const stored = await getGraphToken();
    console.log(
      stored
        ? `✅ Stored token: present (account ${stored.account}, scopes: ${stored.scope})`
        : "❌ Stored token: NONE — run `npm run graph:connect` first",
    );

    if (!stored) {
      await mongoose.disconnect();
      process.exit(1);
    }

    if (stored.account.toLowerCase() !== env.emailSender.toLowerCase()) {
      console.warn(
        `⚠️  Stored account (${stored.account}) differs from EMAIL_SENDER (${env.emailSender}) — mail will send as the stored account.`,
      );
    }
  }

  if (!recipient) {
    console.log(
      "\nNo recipient given, so nothing was sent. To send one test message:\n  npm run verify:graph -- you@libas.in",
    );
    await mongoose.disconnect();
    return;
  }

  console.log(`\nSending a test message to ${recipient}…`);
  await sendEmail(
    recipient,
    "Graph mail test - Libas TalentSpark",
    "<p>If you are reading this, OTP mail is working. Check the From address.</p>",
  );
  console.log("✅ Sent. Confirm the From address on the received mail.");

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch(async (err: Error) => {
    console.error("\n❌ verify:graph failed:", err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
