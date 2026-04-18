import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    collegeId?: string;
    collegeName?: string;
  };
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";
  if (!name || !email || !email.includes("@") || message.length < 8) {
    return NextResponse.json({ error: "Name, valid email, and a short message (8+ chars) are required." }, { status: 400 });
  }
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : null;
  const collegeId = typeof body.collegeId === "string" ? body.collegeId.trim().slice(0, 200) : null;
  const collegeName = typeof body.collegeName === "string" ? body.collegeName.trim().slice(0, 500) : null;
  await prisma.guidanceLead.create({
    data: { name, email, phone, message, collegeId, collegeName },
  });
  return NextResponse.json({ ok: true });
}
