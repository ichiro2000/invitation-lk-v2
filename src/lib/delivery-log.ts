import prisma from "./db";

export type DeliveryChannel = "EMAIL" | "SMS" | "WHATSAPP";
export type DeliveryStatus =
  | "SENT"
  | "FAILED"
  | "DELIVERED"
  | "BOUNCED"
  | "OPENED"
  | "CLICKED";

// Known email template slugs used across src/lib/resend.ts. Keep in sync with
// the `template:` arg of every sendEmailAndLog call.
export const EMAIL_TEMPLATES = [
  "welcome",
  "email_verification",
  "password_reset",
  "payment_confirmation",
  "admin_new_user",
  "admin_payment_alert",
  "support_ticket_created_admin",
  "support_ticket_reply_customer",
] as const;
export type EmailTemplate = (typeof EMAIL_TEMPLATES)[number];

type LogArgs = {
  channel: DeliveryChannel;
  status: DeliveryStatus;
  recipient: string | string[];
  subject?: string;
  template?: string;
  provider?: string;
  providerId?: string | null;
  userId?: string | null;
  error?: unknown;
  metadata?: Record<string, unknown>;
};

function stringifyRecipient(r: string | string[]): string {
  return Array.isArray(r) ? r.join(", ") : r;
}

function stringifyError(err: unknown): string | null {
  if (err == null) return null;
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// Write one row. Swallows errors — logging must never break the caller, since
// the original send path today already fire-and-forgets email failures.
export async function recordDelivery(args: LogArgs): Promise<void> {
  try {
    await prisma.deliveryLog.create({
      data: {
        channel: args.channel,
        status: args.status,
        provider: args.provider ?? null,
        providerId: args.providerId ?? null,
        recipient: stringifyRecipient(args.recipient),
        subject: args.subject ?? null,
        template: args.template ?? null,
        userId: args.userId ?? null,
        error: stringifyError(args.error),
        metadata: args.metadata ? (args.metadata as object) : undefined,
      },
    });
  } catch (err) {
    console.error("[delivery-log] failed to record", args.template, err);
  }
}
