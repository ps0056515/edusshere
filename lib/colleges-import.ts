import prisma from "@/lib/prisma";
import type { CollegeRow } from "@/lib/colleges-index";
import type { ImportedCollege } from "@prisma/client";

const PREFIX = "ic";

export function importedCollegeId(dbId: string): string {
  return `${PREFIX}-${dbId}`;
}

export function isImportedCollegeId(id: string): boolean {
  return id.startsWith(`${PREFIX}-`);
}

export function stripImportedPrefix(id: string): string | null {
  if (!isImportedCollegeId(id)) return null;
  return id.slice(PREFIX.length + 1);
}

export function prismaImportedToRow(r: ImportedCollege): CollegeRow {
  return {
    id: importedCollegeId(r.id),
    name: r.name,
    state: r.state ?? "",
    district: r.district ?? "",
    city: r.city ?? r.district ?? "",
    type: r.type ?? "Imported",
    rating: r.rating != null ? Math.min(5, Math.round(r.rating * 10) / 10) : 4,
    rank: 0,
    fees: r.fees ?? "—",
    naac: r.naac ?? "—",
    placements: r.placements ?? "—",
    accept: r.accept ?? "—",
    courses: r.courses ?? "—",
  };
}

let cache: { at: number; rows: CollegeRow[] } | null = null;
const TTL_MS = 15_000;

export function invalidateImportedCollegeCache(): void {
  cache = null;
}

export async function fetchImportedCollegeRows(): Promise<CollegeRow[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    /* Oldest first so dedupe merge keeps the newest row when keys collide. */
    const rows = await prisma.importedCollege.findMany({ orderBy: { createdAt: "asc" } });
    const mapped = rows.map(prismaImportedToRow);
    cache = { at: Date.now(), rows: mapped };
    return mapped;
  } catch (err) {
    console.error("[fetchImportedCollegeRows] DB unavailable or schema mismatch — continuing without imports:", err);
    cache = { at: Date.now(), rows: [] };
    return [];
  }
}
