function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function welcomeEmailHtml(name: string): string {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">Welcome to INVITATION.LK</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi ${safeName},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
        Your account has been created successfully! You can now start building your beautiful digital wedding invitation.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://invitation.lk"}/dashboard"
         style="display: inline-block; background: #e11d48; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Go to Dashboard
      </a>
      <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0; line-height: 1.5;">
        If you have any questions, reply to this email. We're happy to help!
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function emailVerificationHtml(name: string, verifyUrl: string): string {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">Verify Your Email</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi ${safeName},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
        Thanks for signing up to INVITATION.LK. Please confirm your email address by clicking the button below. This link expires in 24 hours.
      </p>
      <a href="${verifyUrl}"
         style="display: inline-block; background: #e11d48; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Verify Email
      </a>
      <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0; line-height: 1.5;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <span style="color: #6b7280; word-break: break-all;">${verifyUrl}</span>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0; line-height: 1.5;">
        If you didn't create an account with INVITATION.LK, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function paymentConfirmationHtml(
  name: string,
  plan: string,
  amount: string,
  method: string
): string {
  const safeName = escapeHtml(name);
  const safePlan = escapeHtml(plan);
  const safeAmount = escapeHtml(amount);
  const safeMethod = escapeHtml(method);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">Payment Confirmed!</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi ${safeName},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
        Your payment has been confirmed. Here are the details:
      </p>
      <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Plan</td><td style="padding: 6px 0; font-size: 13px; color: #374151; font-weight: 600; text-align: right;">${safePlan}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Amount</td><td style="padding: 6px 0; font-size: 13px; color: #374151; font-weight: 600; text-align: right;">Rs. ${safeAmount}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Method</td><td style="padding: 6px 0; font-size: 13px; color: #374151; font-weight: 600; text-align: right;">${safeMethod}</td></tr>
        </table>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://invitation.lk"}/dashboard"
         style="display: inline-block; background: #e11d48; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Go to Dashboard
      </a>
    </div>
  </div>
</body>
</html>`;
}

export function passwordResetHtml(name: string, resetUrl: string): string {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">Reset Your Password</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi ${safeName},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
        We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}"
         style="display: inline-block; background: #e11d48; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Reset Password
      </a>
      <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0; line-height: 1.5;">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function adminNewUserHtml(args: {
  email: string;
  yourName: string;
  partnerName: string;
  phone: string | null;
  weddingDate: Date | null;
  venue: string | null;
}): string {
  const { email, yourName, partnerName, phone, weddingDate, venue } = args;
  const safeEmail = escapeHtml(email);
  const safeYourName = escapeHtml(yourName || "—");
  const safePartnerName = escapeHtml(partnerName || "—");
  const safePhone = escapeHtml(phone || "—");
  const safeVenue = escapeHtml(venue || "—");
  const safeDate = weddingDate
    ? escapeHtml(new Date(weddingDate).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }))
    : "—";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: #111827; padding: 24px 32px;">
      <p style="color: #9ca3af; margin: 0 0 4px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">Admin Alert</p>
      <h1 style="color: #fff; margin: 0; font-size: 20px;">New user registered</h1>
    </div>
    <div style="padding: 28px 32px;">
      <div style="background: #f9fafb; border-radius: 12px; padding: 18px 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Email</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeEmail}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Couple</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeYourName} &amp; ${safePartnerName}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Phone</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safePhone}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Wedding date</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeDate}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Venue</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeVenue}</td></tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin: 20px 0 0; line-height: 1.5;">
        This notification was sent because a new user signed up on INVITATION.LK.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function adminPaymentAlertHtml(args: {
  userEmail: string;
  userName: string;
  plan: string;
  amount: string;
  method: string;
}): string {
  const { userEmail, userName, plan, amount, method } = args;
  const safeUserEmail = escapeHtml(userEmail);
  const safeUserName = escapeHtml(userName || "—");
  const safePlan = escapeHtml(plan);
  const safeAmount = escapeHtml(amount);
  const safeMethod = escapeHtml(method);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: #065f46; padding: 24px 32px;">
      <p style="color: #a7f3d0; margin: 0 0 4px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">Admin Alert</p>
      <h1 style="color: #fff; margin: 0; font-size: 20px;">Payment received — ${safePlan}</h1>
    </div>
    <div style="padding: 28px 32px;">
      <div style="background: #f9fafb; border-radius: 12px; padding: 18px 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Customer</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeUserName}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Email</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeUserEmail}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Plan</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safePlan}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Amount</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">Rs. ${safeAmount}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Method</td><td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeMethod}</td></tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin: 20px 0 0; line-height: 1.5;">
        This notification was sent because a customer's payment was confirmed on INVITATION.LK.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function supportTicketCreatedAdminHtml(args: {
  customerName: string;
  customerEmail: string;
  subject: string;
  priority: string;
  message: string;
  ticketUrl: string;
}): string {
  const safe = {
    customerName: escapeHtml(args.customerName),
    customerEmail: escapeHtml(args.customerEmail),
    subject: escapeHtml(args.subject),
    priority: escapeHtml(args.priority),
    message: escapeHtml(args.message),
  };
  const priorityColor = args.priority === "URGENT"
    ? "#dc2626"
    : args.priority === "HIGH"
      ? "#d97706"
      : args.priority === "LOW"
        ? "#6b7280"
        : "#2563eb";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: #1f2937; padding: 24px 32px;">
      <p style="color: #9ca3af; margin: 0 0 4px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">Support Ticket</p>
      <h1 style="color: #fff; margin: 0; font-size: 20px;">${safe.subject}</h1>
    </div>
    <div style="padding: 28px 32px;">
      <div style="background: #f9fafb; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-size: 13px; color: #6b7280; width: 35%;">From</td><td style="padding: 4px 0; font-size: 13px; color: #111827; font-weight: 600;">${safe.customerName}</td></tr>
          <tr><td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Email</td><td style="padding: 4px 0; font-size: 13px; color: #111827;">${safe.customerEmail}</td></tr>
          <tr><td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Priority</td><td style="padding: 4px 0; font-size: 13px; color: ${priorityColor}; font-weight: 600;">${safe.priority}</td></tr>
        </table>
      </div>
      <p style="font-size: 11px; color: #9ca3af; margin: 0 0 6px; letter-spacing: 0.06em; text-transform: uppercase;">Message</p>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${safe.message}</div>
      <a href="${args.ticketUrl}"
         style="display: inline-block; margin-top: 24px; background: #e11d48; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Open ticket in admin
      </a>
    </div>
  </div>
</body>
</html>`;
}

export function supportTicketReplyCustomerHtml(args: {
  customerName: string;
  subject: string;
  message: string;
  ticketUrl: string;
}): string {
  const safe = {
    customerName: escapeHtml(args.customerName),
    subject: escapeHtml(args.subject),
    message: escapeHtml(args.message),
  };
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">INVITATION.LK Support replied</h1>
    </div>
    <div style="padding: 28px 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 12px;">Hi ${safe.customerName},</p>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 18px; line-height: 1.6;">
        We&apos;ve replied to your support ticket <strong style="color: #111827;">&ldquo;${safe.subject}&rdquo;</strong>.
      </p>
      <div style="background: #fdf2f8; border: 1px solid #fce7f3; border-radius: 12px; padding: 16px; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap; margin-bottom: 20px;">${safe.message}</div>
      <a href="${args.ticketUrl}"
         style="display: inline-block; background: #e11d48; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View ticket
      </a>
      <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0; line-height: 1.5;">
        Reply to this message inside the ticket — not by replying to this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}
