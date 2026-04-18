import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const STATUSES = new Set(["planned", "in_progress", "submitted", "withdrawn"]);

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const existing = await prisma.applicationTracker.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await req.json()) as {
    collegeName?: string;
    collegeId?: string | null;
    program?: string | null;
    deadline?: string | null;
    status?: string;
    notes?: string | null;
  };
  const data: {
    collegeName?: string;
    collegeId?: string | null;
    program?: string | null;
    deadline?: Date | null;
    status?: string;
    notes?: string | null;
  } = {};
  if (typeof body.collegeName === "string") {
    const t = body.collegeName.trim();
    if (!t) return NextResponse.json({ error: "collegeName cannot be empty" }, { status: 400 });
    data.collegeName = t.slice(0, 400);
  }
  if ("collegeId" in body) {
    data.collegeId =
      typeof body.collegeId === "string" ? body.collegeId.trim().slice(0, 200) || null : null;
  }
  if ("program" in body) {
    data.program = typeof body.program === "string" ? body.program.trim().slice(0, 200) || null : null;
  }
  if ("deadline" in body) {
    if (body.deadline === null || body.deadline === "") {
      data.deadline = null;
    } else if (typeof body.deadline === "string" && body.deadline.trim()) {
      const d = new Date(body.deadline);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
      }
      data.deadline = d;
    }
  }
  if (typeof body.status === "string") {
    if (!STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if ("notes" in body) {
    data.notes = typeof body.notes === "string" ? body.notes.slice(0, 8000) || null : null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  const row = await prisma.applicationTracker.update({
    where: { id },
    data,
  });
  return NextResponse.json({
    item: {
      id: row.id,
      collegeName: row.collegeName,
      collegeId: row.collegeId,
      program: row.program,
      deadline: row.deadline?.toISOString() ?? null,
      status: row.status,
      notes: row.notes,
      updatedAt: row.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const res = await prisma.applicationTracker.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (res.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
