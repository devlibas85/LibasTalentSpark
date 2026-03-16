// import nodemailer from "nodemailer";
// import { env } from "./env.js";

// export const sendEmail = async (to: string, subject: string, html: string) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: env.smtpUser,
//       pass: env.smtpPass,
//     },
//   });

//   await transporter.sendMail({
//     from: `"Libas TalentSpark" <${env.smtpUser}>`,
//     to,
//     subject,
//     html,
//   });
// };

import fetch from "node-fetch";

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

const tenantId: string = process.env.TENANT_ID as string;
const clientId: string = process.env.CLIENT_ID as string;
const clientSecret: string = process.env.CLIENT_SECRET as string;

async function getToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
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
    `https://graph.microsoft.com/v1.0/users/dev@libas.in/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: {
            contentType: "HTML",
            content: html,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email send failed: ${text}`);
  }
}
