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
