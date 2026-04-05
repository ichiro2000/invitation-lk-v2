import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, yourName: true },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomUUID();

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new token with 1 hour expiry
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, user.yourName || "User", token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
