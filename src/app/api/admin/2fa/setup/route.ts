import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  generateTotpSecret,
  buildOtpauthUrl,
  buildQrCodeDataUrl,
} from "@/lib/totp";

// Returns a freshly-generated secret + QR. Does NOT persist anything. Client
// must POST the code back to /enable with the secret to commit enrollment.
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true, twoFactorEnabledAt: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (me.twoFactorEnabledAt) {
      return NextResponse.json(
        { error: "2FA is already enabled. Disable it first to re-enroll." },
        { status: 409 }
      );
    }

    const secret = generateTotpSecret();
    const otpauthUrl = buildOtpauthUrl(me.email, secret);
    const qrCodeDataUrl = await buildQrCodeDataUrl(otpauthUrl);

    return NextResponse.json({ secret, otpauthUrl, qrCodeDataUrl });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA setup" },
      { status: 500 }
    );
  }
}
