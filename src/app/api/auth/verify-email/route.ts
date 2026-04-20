import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invitation.lk";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/verify-email?status=invalid`);
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.redirect(`${APP_URL}/verify-email?status=invalid`);
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.redirect(`${APP_URL}/verify-email?status=expired`);
    }

    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });

    return NextResponse.redirect(`${APP_URL}/verify-email?status=success`);
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(`${APP_URL}/verify-email?status=error`);
  }
}
