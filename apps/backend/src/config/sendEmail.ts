import nodemailer from "nodemailer";
import { env } from "./env.js";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"Libas TalentSpark" <${env.smtpUser}>`,
    to,
    subject,
    html,
  });
};
