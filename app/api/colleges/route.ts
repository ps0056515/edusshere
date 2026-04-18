import { NextResponse } from "next/server";
import { queryCollegesMerged } from "@/lib/colleges-merge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(48, Math.max(6, Number(searchParams.get("pageSize") ?? "12") || 12));
    const state = searchParams.get("state") ?? undefined;
    const district = searchParams.get("district") ?? undefined;
    const q = searchParams.get("q") ?? undefined;
    const course = searchParams.get("course") ?? undefined;
    const exam = searchParams.get("exam") ?? undefined;

    const { items, total } = await queryCollegesMerged({ page, pageSize, state, district, q, course, exam });
    return NextResponse.json({ items, total, page, pageSize });
  } catch (err) {
    console.error("[GET /api/colleges]", err);
    return NextResponse.json(
      { items: [], total: 0, page: 1, pageSize: 12, error: "Failed to load colleges." },
      { status: 503 },
    );
  }
}
