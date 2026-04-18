import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";
import { canSendOtp } from "@/lib/otp-rate";

function randomSixDigit(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const gate = canSendOtp(email);
    if (!gate.ok) {
      return NextResponse.json(
        { error: "Too many requests", retryAfterSec: gate.retryAfterSec },
        { status: 429 },
      );
    }

    const code = randomSixDigit();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$transaction([
      prisma.otpCode.deleteMany({ where: { email, consumedAt: null } }),
      prisma.otpCode.create({
        data: { email, codeHash, expiresAt },
      }),
    ]);

    if (process.env.NODE_ENV === "development") {
      console.info(`[EduSphere OTP] ${email} → ${code} (expires ${expiresAt.toISOString()})`);
    }

    return NextResponse.json({
      ok: true,
      devHint: process.env.NODE_ENV === "development" ? "Code printed in server terminal." : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
