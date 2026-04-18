import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  const rows = await prisma.shortlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    items: rows.map((r) => ({ collegeId: r.collegeId, collegeName: r.collegeName ?? "" })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to sync shortlist to your account." }, { status: 401 });
  }
  const body = (await req.json()) as { collegeId?: string; collegeName?: string };
  const collegeId = typeof body.collegeId === "string" ? body.collegeId.trim() : "";
  if (!collegeId) {
    return NextResponse.json({ error: "collegeId required" }, { status: 400 });
  }
  const collegeName = typeof body.collegeName === "string" ? body.collegeName.slice(0, 500) : null;
  const existing = await prisma.shortlistItem.findFirst({
    where: { userId: session.user.id, collegeId },
  });
  if (!existing) {
    await prisma.shortlistItem.create({
      data: { userId: session.user.id, collegeId, collegeName },
    });
  } else if (collegeName) {
    await prisma.shortlistItem.update({
      where: { id: existing.id },
      data: { collegeName },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get("collegeId")?.trim();
  if (!collegeId) {
    return NextResponse.json({ error: "collegeId required" }, { status: 400 });
  }
  await prisma.shortlistItem.deleteMany({
    where: { userId: session.user.id, collegeId },
  });
  return NextResponse.json({ ok: true });
}
