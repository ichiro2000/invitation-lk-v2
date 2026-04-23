import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./db";
import { displayName } from "./user-display";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login", newUser: "/dashboard" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Required");

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.passwordHash) throw new Error("Invalid credentials");

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) throw new Error("Invalid credentials");

        if (user.suspendedAt) {
          throw new Error("Account suspended");
        }

        return {
          id: user.id,
          email: user.email,
          name: displayName(user.yourName, user.partnerName, user.email),
          role: user.role,
          plan: user.plan,
          emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.plan = (user as unknown as { plan: string }).plan;
        token.emailVerified = (user as unknown as { emailVerified: string | null }).emailVerified;
        token.suspended = false;
        token.impersonatedBy = null;
        // Fetch 2FA state once at login. Refreshed via `update()` below.
        const full = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { twoFactorEnabledAt: true },
        });
        token.twoFactorEnabled = !!full?.twoFactorEnabledAt;
      }
      // Refresh plan from DB when client calls update(). Important: preserve
      // the impersonatedBy claim across refreshes so the banner stays up and
      // /api/impersonate/exit keeps working until the admin explicitly exits.
      if (trigger === "update" && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, role: true, emailVerified: true, suspendedAt: true, twoFactorEnabledAt: true },
        });
        if (freshUser) {
          token.plan = freshUser.plan;
          token.role = freshUser.role;
          token.emailVerified = freshUser.emailVerified ? freshUser.emailVerified.toISOString() : null;
          token.suspended = !!freshUser.suspendedAt;
          token.twoFactorEnabled = !!freshUser.twoFactorEnabledAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.emailVerified = (token.emailVerified as string | null) ?? null;
        session.user.suspended = (token.suspended as boolean) ?? false;
        session.user.impersonatedBy = (token.impersonatedBy as string | null) ?? null;
        session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
      }
      return session;
    },
  },
};
