import { Resend } from "resend";
import prisma from "./db";
import { recordDelivery, type EmailTemplate } from "./delivery-log";
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

type ResendSendArgs = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

// Central send wrapper. Calls Resend, writes a DeliveryLog row for both
// success and failure, and mirrors the original sender's { success, error }
// contract so no call site behaviour changes.
async function sendEmailAndLog(
  resend: Resend,
  args: ResendSendArgs,
  meta: { template: EmailTemplate; userId?: string | null }
): Promise<{ success: true } | { success: false; error: unknown }> {
  try {
    const result = await resend.emails.send(args);
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
        from: FROM,
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
        from: FROM,
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
        from: FROM,
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
        from: FROM,
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
        from: FROM,
        to: recipients,
        subject: `New signup: ${args.yourName} & ${args.partnerName}`,
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
        from: FROM,
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
        from: FROM,
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
        from: FROM,
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
