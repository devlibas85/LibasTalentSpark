import fetch from "node-fetch";
import { env } from "./env.js";

type TokenResponse = {
  access_token: string;
  expires_in: number;
};

async function getToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${env.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.statusText}`);
  }

  const data = (await res.json()) as TokenResponse;
  return data.access_token;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const token = await getToken();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${env.emailSender}/sendMail`,
    {
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
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email send failed: ${text}`);
  }
}
