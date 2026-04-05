import { Resend } from "resend";
import {
  welcomeEmailHtml,
  paymentConfirmationHtml,
  passwordResetHtml,
} from "./email-templates";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, emails will not be sent");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "INVITATION.LK <noreply@invitation.lk>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invitation.lk";

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to INVITATION.LK!",
      html: welcomeEmailHtml(name),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  plan: string,
  amount: string,
  method: string
) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Payment Confirmed — ${plan}`,
      html: paymentConfirmationHtml(name, plan, amount, method),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Reset Your Password — INVITATION.LK",
      html: passwordResetHtml(name, resetUrl),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}
