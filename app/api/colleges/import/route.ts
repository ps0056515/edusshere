import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { invalidateImportedCollegeCache } from "@/lib/colleges-import";

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_ROWS = 2500;

const HEADER_ALIASES: Record<string, keyof RowKeys> = {
  name: "name",
  college_name: "name",
  institution: "name",
  institution_name: "name",
  college: "name",
  state: "state",
  state_ut: "state",
  stateunion_territory: "state",
  district: "district",
  city: "city",
  type: "type",
  rating: "rating",
  fees: "fees",
  naac: "naac",
  placements: "placements",
  placement: "placements",
  avg_ctc: "placements",
  accept: "accept",
  admission: "accept",
  exam: "accept",
  courses: "courses",
  programmes: "courses",
  programs: "courses",
};

type RowKeys = {
  name: string;
  state?: string;
  district?: string;
  city?: string;
  type?: string;
  rating?: string;
  fees?: string;
  naac?: string;
  placements?: string;
  accept?: string;
  courses?: string;
};

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function mapRow(raw: Record<string, string>): RowKeys | null {
  const canon: Partial<Record<keyof RowKeys, string>> = {};
  for (const [k, v] of Object.entries(raw)) {
    const nk = normalizeHeader(k);
    const target = HEADER_ALIASES[nk];
    if (target && v !== undefined && v !== "") {
      canon[target] = v.trim();
    }
  }
  const name = canon.name?.trim();
  if (!name) return null;
  return {
    name,
    state: canon.state,
    district: canon.district,
    city: canon.city,
    type: canon.type,
    rating: canon.rating,
    fees: canon.fees,
    naac: canon.naac,
    placements: canon.placements,
    accept: canon.accept,
    courses: canon.courses,
  };
}

function parseRating(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB)` }, { status: 400 });
  }

  const text = await file.text();
  let records: Record<string, string>[];
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    }) as Record<string, string>[];
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid CSV";
    return NextResponse.json({ error: `CSV parse error: ${msg}` }, { status: 400 });
  }

  if (records.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS})` }, { status: 400 });
  }

  const errors: string[] = [];
  const toCreate: {
    name: string;
    state: string | null;
    district: string | null;
    city: string | null;
    type: string | null;
    rating: number | null;
    fees: string | null;
    naac: string | null;
    placements: string | null;
    accept: string | null;
    courses: string | null;
  }[] = [];

  let skipped = 0;
  for (let i = 0; i < records.length; i++) {
    const rec = records[i]!;
    const mapped = mapRow(rec);
    if (!mapped) {
      skipped += 1;
      if (errors.length < 50) errors.push(`Row ${i + 2}: missing name (or college_name / institution)`);
      continue;
    }
    toCreate.push({
      name: mapped.name.slice(0, 500),
      state: mapped.state?.slice(0, 120) ?? null,
      district: mapped.district?.slice(0, 200) ?? null,
      city: mapped.city?.slice(0, 200) ?? null,
      type: mapped.type?.slice(0, 120) ?? null,
      rating: parseRating(mapped.rating),
      fees: mapped.fees?.slice(0, 120) ?? null,
      naac: mapped.naac?.slice(0, 20) ?? null,
      placements: mapped.placements?.slice(0, 120) ?? null,
      accept: mapped.accept?.slice(0, 200) ?? null,
      courses: mapped.courses?.slice(0, 500) ?? null,
    });
  }

  let imported = 0;
  const chunk = 300;
  for (let i = 0; i < toCreate.length; i += chunk) {
    const slice = toCreate.slice(i, i + chunk);
    const r = await prisma.importedCollege.createMany({ data: slice });
    imported += r.count;
  }

  invalidateImportedCollegeCache();

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    errors: errors.length ? errors : undefined,
  });
}
