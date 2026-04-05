import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/resend";
import { authLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = authLimiter.check(5, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { yourName, partnerName, weddingDate, venue, email, phone, password } = await request.json();

    if (!yourName || !partnerName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Unable to create account. Please try a different email or sign in." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        yourName,
        partnerName,
        email,
        phone: phone || null,
        passwordHash,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        venue: venue || null,
        role: "CUSTOMER",
        plan: "FREE",
      },
    });

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail(email, yourName).catch(() => {});

    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
