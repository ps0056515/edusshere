import { NextResponse } from "next/server";
import { resolveCollegeById } from "@/lib/colleges-merge";

const MAX = 3;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.getAll("id").filter(Boolean);
  const raw = searchParams.get("ids");
  const list = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : ids;
  const unique = [...new Set(list)].slice(0, MAX);
  if (unique.length === 0) {
    return NextResponse.json({ items: [] as unknown[], error: "Pass id=… repeated or ids=a,b,c" }, { status: 400 });
  }
  const items = [];
  for (const id of unique) {
    let decoded = id;
    try {
      decoded = decodeURIComponent(id);
    } catch {
      /* keep */
    }
    const row = await resolveCollegeById(decoded);
    if (row) items.push(row);
  }
  return NextResponse.json({ items });
}
