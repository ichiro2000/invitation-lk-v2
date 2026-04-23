import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db";
import {
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendAdminNewUserNotification,
} from "@/lib/resend";
import { authLimiter } from "@/lib/rate-limit";
import { getFlag } from "@/lib/settings-read";

export async function POST(request: Request) {
  try {
    if (!(await getFlag("feature_signup_open"))) {
      return NextResponse.json(
        { error: "Signups are currently closed. Please check back soon." },
        { status: 503 }
      );
    }

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

    // Create user first (without nested invitation to avoid schema mismatch)
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

    // Try to create invitation separately (won't block registration if it fails)
    try {
      const code = Math.random().toString(36).slice(2, 8);
      const inv = await prisma.invitation.create({
        data: {
          userId: user.id,
          templateSlug: "royal-elegance",
          slug: code,
          groomName: yourName,
          brideName: partnerName,
          weddingDate: weddingDate ? new Date(weddingDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          venue: venue || "Wedding Venue",
        },
      });
      // Create default events
      try {
        await prisma.event.createMany({
          data: [
            { invitationId: inv.id, title: "Wedding Ceremony", time: "4:00 PM", sortOrder: 0 },
            { invitationId: inv.id, title: "Reception", time: "7:00 PM", sortOrder: 1 },
          ],
        });
      } catch { /* events creation is optional */ }
    } catch (invError) {
      console.error("Auto-create invitation failed (non-blocking):", invError);
      // Registration still succeeds — invitation can be created later via editor
    }

    // Fire-and-forget notifications
    sendWelcomeEmail(email, yourName, user.id).catch(() => {});

    // Email verification token — 24h expiry
    (async () => {
      try {
        const token = crypto.randomBytes(32).toString("hex");
        await prisma.verificationToken.deleteMany({ where: { identifier: email } });
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        await sendEmailVerificationEmail(email, yourName, token, user.id);
      } catch (err) {
        console.error("Verification email flow failed (non-blocking):", err);
      }
    })();

    // Admin signup alert
    sendAdminNewUserNotification({
      email,
      yourName,
      partnerName,
      phone: phone || null,
      weddingDate: weddingDate ? new Date(weddingDate) : null,
      venue: venue || null,
    }).catch(() => {});

    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
