import { Resend } from "resend";
import prisma from "./db";
import {
  welcomeEmailHtml,
  emailVerificationHtml,
  paymentConfirmationHtml,
  passwordResetHtml,
  adminNewUserHtml,
  adminPaymentAlertHtml,
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

async function getAdminRecipients(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    const emails = admins.map((a) => a.email).filter(Boolean);
    if (emails.length > 0) return emails;
  } catch (error) {
    console.error("Failed to look up admin users:", error);
  }
  const fallback = process.env.ADMIN_EMAIL;
  return fallback ? [fallback] : [];
}

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

export async function sendEmailVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Verify your email — INVITATION.LK",
      html: emailVerificationHtml(name, verifyUrl),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
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

export async function sendAdminNewUserNotification(args: {
  email: string;
  yourName: string;
  partnerName: string;
  phone: string | null;
  weddingDate: Date | null;
  venue: string | null;
}) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    const recipients = await getAdminRecipients();
    if (recipients.length === 0) return { success: false, error: "No admin recipients" };
    await resend.emails.send({
      from: FROM,
      to: recipients,
      subject: `New signup: ${args.yourName} & ${args.partnerName}`,
      html: adminNewUserHtml(args),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send admin new-user notification:", error);
    return { success: false, error };
  }
}

export async function sendAdminPaymentNotification(args: {
  userEmail: string;
  userName: string;
  plan: string;
  amount: string;
  method: string;
}) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    const recipients = await getAdminRecipients();
    if (recipients.length === 0) return { success: false, error: "No admin recipients" };
    await resend.emails.send({
      from: FROM,
      to: recipients,
      subject: `Payment received — ${args.plan} (Rs. ${args.amount})`,
      html: adminPaymentAlertHtml(args),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send admin payment notification:", error);
    return { success: false, error };
  }
}
