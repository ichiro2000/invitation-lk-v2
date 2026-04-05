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

    // Generate unique invitation code
    const code = Math.random().toString(36).slice(2, 8);

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
        invitation: {
          create: {
            templateSlug: "royal-elegance",
            slug: code,
            groomName: yourName,
            brideName: partnerName,
            weddingDate: weddingDate ? new Date(weddingDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            venue: venue || "Wedding Venue",
            events: {
              create: [
                { title: "Wedding Ceremony", time: "4:00 PM", sortOrder: 0 },
                { title: "Reception", time: "7:00 PM", sortOrder: 1 },
              ],
            },
          },
        },
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
