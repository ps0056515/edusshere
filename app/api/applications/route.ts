import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const STATUSES = new Set(["planned", "in_progress", "submitted", "withdrawn"]);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.applicationTracker.findMany({
    where: { userId: session.user.id },
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      collegeName: r.collegeName,
      collegeId: r.collegeId,
      program: r.program,
      deadline: r.deadline?.toISOString() ?? null,
      status: r.status,
      notes: r.notes,
      updatedAt: r.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    collegeName?: string;
    collegeId?: string | null;
    program?: string | null;
    deadline?: string | null;
    status?: string;
    notes?: string | null;
  };
  const collegeName = typeof body.collegeName === "string" ? body.collegeName.trim() : "";
  if (!collegeName) {
    return NextResponse.json({ error: "collegeName required" }, { status: 400 });
  }
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "planned";
  let deadline: Date | null = null;
  if (typeof body.deadline === "string" && body.deadline.trim()) {
    const d = new Date(body.deadline);
    if (!Number.isNaN(d.getTime())) deadline = d;
  }
  const row = await prisma.applicationTracker.create({
    data: {
      userId: session.user.id,
      collegeName: collegeName.slice(0, 400),
      collegeId: typeof body.collegeId === "string" ? body.collegeId.trim().slice(0, 200) || null : null,
      program: typeof body.program === "string" ? body.program.trim().slice(0, 200) || null : null,
      deadline,
      status,
      notes: typeof body.notes === "string" ? body.notes.slice(0, 8000) || null : null,
    },
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
