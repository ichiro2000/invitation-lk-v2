import { Resend } from "resend";
import prisma from "./db";
import { recordDelivery, type EmailTemplate } from "./delivery-log";
import { getSettings } from "./settings-read";
import { displayName } from "./user-display";
import {
  welcomeEmailHtml,
  emailVerificationHtml,
  paymentConfirmationHtml,
  passwordResetHtml,
  adminNewUserHtml,
  adminPaymentAlertHtml,
  supportTicketCreatedAdminHtml,
  supportTicketReplyCustomerHtml,
} from "./email-templates";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, emails will not be sent");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invitation.lk";

const EMAIL_KEYS = [
  "email_from_name",
  "email_from_address",
  "email_reply_to",
  "email_admin_recipients",
] as const;

// Build the "From: Name <addr>" header from admin settings. If the admin
// saved an unverified address, Resend will reject the send — the failure is
// logged to DeliveryLog with the provider error so it's easy to diagnose.
async function getEmailEnvelope(): Promise<{ from: string; replyTo?: string }> {
  const s = await getSettings(EMAIL_KEYS);
  const name = s.email_from_name.trim() || "INVITATION.LK";
  const addr = s.email_from_address.trim() || "noreply@invitation.lk";
  const from = `${name} <${addr}>`;
  const replyTo = s.email_reply_to.trim();
  return replyTo ? { from, replyTo } : { from };
}

async function getAdminRecipients(): Promise<string[]> {
  // 1. Admin-configured override (comma-separated list in Settings).
  try {
    const { email_admin_recipients } = await getSettings(["email_admin_recipients"]);
    const override = email_admin_recipients
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\S+@\S+\.\S+$/.test(s));
    if (override.length > 0) return override;
  } catch (error) {
    console.error("Failed to read admin-recipient override:", error);
  }

  // 2. Users with ADMIN role.
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

  // 3. ADMIN_EMAIL env fallback — kept so a fresh prod without any admin users
  // still pages someone.
  const fallback = process.env.ADMIN_EMAIL;
  return fallback ? [fallback] : [];
}

type ResendSendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

// Central send wrapper. Reads the from/reply-to envelope from admin Settings
// on every call (cached), calls Resend, writes a DeliveryLog row for both
// success and failure, and mirrors the original sender's { success, error }
// contract so no call site behaviour changes.
async function sendEmailAndLog(
  resend: Resend,
  args: ResendSendArgs,
  meta: { template: EmailTemplate; userId?: string | null }
): Promise<{ success: true } | { success: false; error: unknown }> {
  const envelope = await getEmailEnvelope();
  const payload = {
    from: envelope.from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    ...(envelope.replyTo ? { replyTo: envelope.replyTo } : {}),
  };
  try {
    const result = await resend.emails.send(payload);
    const providerId =
      (result && typeof result === "object" && "data" in result
        ? (result.data as { id?: string } | null)?.id
        : undefined) ?? null;
    await recordDelivery({
      channel: "EMAIL",
      status: "SENT",
      provider: "resend",
      providerId,
      recipient: args.to,
      subject: args.subject,
      template: meta.template,
      userId: meta.userId ?? null,
    });
    return { success: true };
  } catch (error) {
    await recordDelivery({
      channel: "EMAIL",
      status: "FAILED",
      provider: "resend",
      recipient: args.to,
      subject: args.subject,
      template: meta.template,
      userId: meta.userId ?? null,
      error,
    });
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string, userId?: string) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    return await sendEmailAndLog(
      resend,
      {
        to: email,
        subject: "Welcome to INVITATION.LK!",
        html: welcomeEmailHtml(name),
      },
      { template: "welcome", userId }
    );
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendEmailVerificationEmail(
  email: string,
  name: string,
  token: string,
  userId?: string
) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    return await sendEmailAndLog(
      resend,
      {
        to: email,
        subject: "Verify your email — INVITATION.LK",
        html: emailVerificationHtml(name, verifyUrl),
      },
      { template: "email_verification", userId }
    );
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
  method: string,
  userId?: string
) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    return await sendEmailAndLog(
      resend,
      {
        to: email,
        subject: `Payment Confirmed — ${plan}`,
        html: paymentConfirmationHtml(name, plan, amount, method),
      },
      { template: "payment_confirmation", userId }
    );
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
  userId?: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    return await sendEmailAndLog(
      resend,
      {
        to: email,
        subject: "Reset Your Password — INVITATION.LK",
        html: passwordResetHtml(name, resetUrl),
      },
      { template: "password_reset", userId }
    );
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
    return await sendEmailAndLog(
      resend,
      {
        to: recipients,
        subject: `New signup: ${displayName(args.yourName, args.partnerName, args.email)}`,
        html: adminNewUserHtml(args),
      },
      { template: "admin_new_user" }
    );
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
    return await sendEmailAndLog(
      resend,
      {
        to: recipients,
        subject: `Payment received — ${args.plan} (Rs. ${args.amount})`,
        html: adminPaymentAlertHtml(args),
      },
      { template: "admin_payment_alert" }
    );
  } catch (error) {
    console.error("Failed to send admin payment notification:", error);
    return { success: false, error };
  }
}

export async function sendSupportTicketCreatedToAdmin(args: {
  ticketId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  priority: string;
  message: string;
}) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    const recipients = await getAdminRecipients();
    if (recipients.length === 0) return { success: false, error: "No admin recipients" };
    const ticketUrl = `${APP_URL}/admin/support/${args.ticketId}`;
    return await sendEmailAndLog(
      resend,
      {
        to: recipients,
        subject: `[${args.priority}] Support ticket: ${args.subject}`,
        html: supportTicketCreatedAdminHtml({ ...args, ticketUrl }),
      },
      { template: "support_ticket_created_admin" }
    );
  } catch (error) {
    console.error("Failed to send support-ticket admin notification:", error);
    return { success: false, error };
  }
}

export async function sendSupportReplyToCustomer(args: {
  ticketId: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  message: string;
  userId?: string;
}) {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email not configured" };
    const ticketUrl = `${APP_URL}/dashboard/support/${args.ticketId}`;
    return await sendEmailAndLog(
      resend,
      {
        to: args.customerEmail,
        subject: `Reply to your ticket: ${args.subject}`,
        html: supportTicketReplyCustomerHtml({ ...args, ticketUrl }),
      },
      { template: "support_ticket_reply_customer", userId: args.userId }
    );
  } catch (error) {
    console.error("Failed to send support-reply customer email:", error);
    return { success: false, error };
  }
}
