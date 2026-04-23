import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendEmailVerificationEmail } from "@/lib/resend";
import { emailLimiter } from "@/lib/rate-limit";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, yourName: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    const { success } = emailLimiter.check(3, user.email);
    if (!success) {
      return NextResponse.json({ error: "Too many requests — please wait before requesting another verification email." }, { status: 429 });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendEmailVerificationEmail(user.email, user.yourName || "there", token, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
