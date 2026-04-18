import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";
import {
  DEMO_LOGIN_PASSWORD,
  DEMO_LOGIN_USERNAME,
  DEMO_USER_EMAIL,
  isDemoLoginEnabled,
} from "@/lib/demo-login";

const googleId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

const googleProvider =
  googleId && googleSecret
    ? Google({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
      })
    : null;

const demoLoginProvider = Credentials({
  id: "demo-login",
  name: "Demo",
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!isDemoLoginEnabled()) return null;
    const u = credentials?.username;
    const p = credentials?.password;
    if (typeof u !== "string" || typeof p !== "string") return null;
    if (u !== DEMO_LOGIN_USERNAME || p !== DEMO_LOGIN_PASSWORD) return null;

    const email = DEMO_USER_EMAIL;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: "Demo User", emailVerified: new Date() },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    return {
      id: user.id,
      email: user.email ?? email,
      name: user.name ?? "Demo User",
      image: user.image,
    };
  },
});

const credentialsProvider = Credentials({
  id: "email-otp",
  name: "Email OTP",
  credentials: {
    email: { label: "Email", type: "email" },
    code: { label: "Code", type: "text" },
  },
  async authorize(credentials) {
    const emailRaw = credentials?.email;
    const codeRaw = credentials?.code;
    if (!emailRaw || typeof emailRaw !== "string" || !codeRaw || typeof codeRaw !== "string") {
      return null;
    }
    const email = normalizeEmail(emailRaw);
    const code = codeRaw.replace(/\D/g, "").slice(0, 6);
    if (!email.includes("@") || code.length !== 6) return null;

    const record = await prisma.otpCode.findFirst({
      where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!record || record.attempts >= 8) return null;

    const match = await bcrypt.compare(code, record.codeHash);
    if (!match) {
      await prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return null;
    }

    await prisma.otpCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, emailVerified: new Date() },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    return {
      id: user.id,
      email: user.email ?? email,
      name: user.name,
      image: user.image,
    };
  },
});

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies Omit<NextAuthConfig, "providers" | "adapter">;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [...(googleProvider ? [googleProvider] : []), demoLoginProvider, credentialsProvider],
});
