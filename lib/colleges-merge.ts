import {
  getAllColleges,
  type CollegeRow,
  type CollegeQuery,
  rowMatchesQuery,
  rowMatchesStructuredFilters,
} from "@/lib/colleges-index";
import { fetchImportedCollegeRows, prismaImportedToRow, stripImportedPrefix } from "@/lib/colleges-import";
import prisma from "@/lib/prisma";

function norm(s: string | undefined | null): string {
  return (s ?? "").trim().toLowerCase();
}

function dedupeKey(c: CollegeRow): string {
  return `${norm(c.name)}|${norm(c.state)}|${norm(c.district)}`;
}

/** Merge synthetic catalogue with CSV imports; imports win on same name+state+district key. */
export async function getMergedColleges(): Promise<CollegeRow[]> {
  const [imported, synthetic] = await Promise.all([fetchImportedCollegeRows(), Promise.resolve(getAllColleges())]);
  const map = new Map<string, CollegeRow>();
  for (const s of synthetic) map.set(dedupeKey(s), s);
  for (const i of imported) map.set(dedupeKey(i), i);
  return Array.from(map.values());
}

export async function queryCollegesMerged(opts: CollegeQuery): Promise<{ items: CollegeRow[]; total: number }> {
  const { page, pageSize, state, district, q, course, exam } = opts;
  const all = await getMergedColleges();
  const filtered = all.filter((c) => {
    if (state && c.state !== state) return false;
    if (district && c.district !== district) return false;
    if (!rowMatchesStructuredFilters(c, { course, exam })) return false;
    return rowMatchesQuery(c, q ?? "");
  });
  const total = filtered.length;
  const start = Math.max(0, (page - 1) * pageSize);
  const items = filtered.slice(start, start + pageSize);
  return { items, total };
}

export async function resolveCollegeById(id: string): Promise<CollegeRow | undefined> {
  const dbId = stripImportedPrefix(id);
  if (dbId) {
    const row = await prisma.importedCollege.findUnique({ where: { id: dbId } });
    return row ? prismaImportedToRow(row) : undefined;
  }
  return getAllColleges().find((c) => c.id === id);
}

/** Neighbouring listings for detail pages — same district, then state + type, then type. */
export async function getSimilarColleges(collegeId: string, limit = 6): Promise<CollegeRow[]> {
  const current = await resolveCollegeById(collegeId);
  if (!current) return [];
  const all = await getMergedColleges();
  const pool = all.filter((c) => c.id !== current.id);
  const tier1 = pool.filter((c) => c.state === current.state && c.district === current.district);
  const tier2 = pool.filter((c) => c.state === current.state && c.type === current.type);
  const tier3 = pool.filter((c) => c.type === current.type);
  const seen = new Set<string>();
  const out: CollegeRow[] = [];
  for (const tier of [tier1, tier2, tier3]) {
    for (const c of tier) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
