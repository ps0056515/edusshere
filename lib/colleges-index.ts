import { INDIA_STATES_AND_UTS, type IndiaState, listDistrictsForState } from "@/lib/india-geo";

export type CollegeRow = {
  id: string;
  name: string;
  state: string;
  district: string;
  city: string;
  type: string;
  rating: number;
  rank: number;
  fees: string;
  naac: string;
  placements: string;
  accept: string;
  /** Programmes / streams — used for search (e.g. B.Tech). */
  courses: string;
};

const INSTITUTION_TYPES = ["Government", "Private", "Deemed", "Central", "State", "Aided"] as const;
const NAAC = ["A++", "A+", "A", "B++", "B+", "B"] as const;
const ENG_EXAMS = [
  "JEE Main",
  "JEE Main",
  "State CET",
  "State CET",
  "JEE Advanced",
  "COMEDK",
  "MHT-CET",
  "KCET",
  "TS EAMCET",
  "WBJEE",
  "GATE",
  "BITSAT",
] as const;
const OTHER_EXAMS = ["CUET", "CAT", "NEET UG", "CLAT", "Merit", "Management quota"] as const;

const BTECH_LABEL =
  "B.Tech — CSE, IT, AI & DS, Data Science, Cyber Security, ECE, EEE, Mechanical, Civil, Chemical, Biotechnology";

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: string, idx: number): T {
  const h = hash32(`${seed}|${idx}`);
  return arr[h % arr.length]!;
}

function feesFromSeed(seed: string): string {
  const h = hash32(seed) % 180;
  const lakhs = 0.8 + (h % 120) / 10;
  return `₹${lakhs.toFixed(1)}L/yr`;
}

function ctcFromSeed(seed: string): string {
  const h = hash32(seed + "ctc") % 200;
  const l = 3 + (h % 45) / 2;
  return `₹${l.toFixed(1)}L avg`;
}

/** First N slots per district are engineering / B.Tech-heavy listings. */
const ENGINEERING_SLOTS_PER_DISTRICT = 16;
/** Total institutions per district (engineering + other streams). */
const COLLEGES_PER_DISTRICT = 22;

const ENG_NAME_BUILDERS: readonly ((d: string, st: string, _i: number) => string)[] = [
  (d) => `Government Engineering College, ${d}`,
  (d) => `Government College of Engineering, ${d}`,
  (d, st) => `University Institute of Engineering & Technology — ${d}, ${st}`,
  (d) => `College of Engineering & Technology, ${d}`,
  (d) => `School of Engineering & Technology, ${d}`,
  (d) => `Institute of Engineering & Sciences, ${d}`,
  (d) => `Shri Institute of Technology & Science, ${d}`,
  (d, st) => `Dr. A.P.J. Abdul Kalam Technical Campus — ${d}, ${st}`,
  (d) => `Regional Engineering College Society — ${d}`,
  (d) => `Faculty of Engineering (Constituent College), ${d}`,
  (d) => `Integrated Campus — School of Technology, ${d}`,
  (d) => `Institute of Advanced Engineering & Technology, ${d}`,
  (d) => `Sir M. Visvesvaraya Memorial College of Engineering, ${d}`,
  (d) => `Pandit Deendayal Energy Technical Institute, ${d}`,
  (d, st) => `National Institute of Technical Education — ${d}, ${st}`,
  (d) => `University Polytechnic & B.Tech Block, ${d}`,
];

const OTHER_TEMPLATES: readonly { name: (d: string, st: string) => string; courses: string; examPool: typeof OTHER_EXAMS }[] = [
  { name: (d) => `District Institute of Education & Training, ${d}`, courses: "B.Ed, D.El.Ed", examPool: OTHER_EXAMS },
  { name: (d) => `Government Polytechnic, ${d}`, courses: "Diploma — Civil, Mechanical, Electrical (lateral B.Tech)", examPool: OTHER_EXAMS },
  { name: (d) => `Institute of Management & Research, ${d}`, courses: "MBA / PGDM", examPool: OTHER_EXAMS },
  { name: (d) => `Government Medical College, ${d}`, courses: "MBBS, BDS", examPool: OTHER_EXAMS },
  { name: (d) => `Law College, ${d}`, courses: "BA LLB, LLB", examPool: OTHER_EXAMS },
  { name: (d, st) => `Arts & Science College, ${d}, ${st}`, courses: "BA, B.Sc, B.Com", examPool: OTHER_EXAMS },
];

function makeCollege(state: IndiaState, district: string, index: number, rank: number): CollegeRow {
  const seed = `${state}::${district}::${index}`;
  const type = pick(INSTITUTION_TYPES, seed, 0);
  const base = 3.5 + (hash32(seed) % 15) / 10;

  if (index < ENGINEERING_SLOTS_PER_DISTRICT) {
    const builder = ENG_NAME_BUILDERS[index % ENG_NAME_BUILDERS.length]!;
    const name = builder(district, state, index);
    return {
      id: Buffer.from(seed).toString("base64url"),
      name,
      state,
      district,
      city: district,
      type,
      rating: Math.min(5, Math.round(base * 10) / 10),
      rank,
      fees: feesFromSeed(seed),
      naac: pick(NAAC, seed, 1),
      placements: ctcFromSeed(seed),
      accept: pick(ENG_EXAMS, seed, 2),
      courses: BTECH_LABEL,
    };
  }

  const t = OTHER_TEMPLATES[(index - ENGINEERING_SLOTS_PER_DISTRICT) % OTHER_TEMPLATES.length]!;
  const name = t.name(district, state);
  return {
    id: Buffer.from(seed).toString("base64url"),
    name,
    state,
    district,
    city: district,
    type,
    rating: Math.min(5, Math.round(base * 10) / 10),
    rank,
    fees: feesFromSeed(seed),
    naac: pick(NAAC, seed, 3),
    placements: ctcFromSeed(seed + "o"),
    accept: pick(t.examPool, seed, 4),
    courses: t.courses,
  };
}

const DATA_VERSION = 4;
let cache: { v: number; rows: CollegeRow[] } | null = null;

export function getAllColleges(): CollegeRow[] {
  if (cache?.v === DATA_VERSION) return cache.rows;
  const out: CollegeRow[] = [];
  let rank = 1;
  for (const state of INDIA_STATES_AND_UTS) {
    const districts = listDistrictsForState(state);
    for (const district of districts) {
      for (let k = 0; k < COLLEGES_PER_DISTRICT; k++) {
        out.push(makeCollege(state, district, k, rank++));
      }
    }
  }
  cache = { v: DATA_VERSION, rows: out };
  return out;
}

export function getCollegeById(id: string): CollegeRow | undefined {
  return getAllColleges().find((c) => c.id === id);
}

export type CollegeQuery = {
  page: number;
  pageSize: number;
  state?: string;
  district?: string;
  q?: string;
  /** Filter rows whose `courses` / name match this stream (e.g. B.Tech, MBA). */
  course?: string;
  /** Filter rows whose `accept` field matches this exam label (e.g. JEE Main). */
  exam?: string;
};

export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function haystack(c: CollegeRow): string {
  return normalizeSearch([c.name, c.city, c.district, c.state, c.type, c.accept, c.courses].join(" "));
}

function matchesNeedle(c: CollegeRow, needleRaw: string): boolean {
  const needle = normalizeSearch(needleRaw);
  if (!needle) return true;
  const hay = haystack(c);
  if (hay.includes(needle)) return true;
  /* common synonyms users type */
  const eng =
    needle.includes("btech") ||
    needle.includes("b tech") ||
    needle.includes("be ") ||
    needle === "be" ||
    needle.includes("engineering") ||
    needle.includes("b.e") ||
    needle.includes("tech");
  if (eng) {
    const cLow = c.courses.toLowerCase();
    const nLow = c.name.toLowerCase();
    if (cLow.includes("b.tech") || cLow.includes("btech") || nLow.includes("engineering") || nLow.includes("technology")) return true;
  }
  return false;
}

/** Course / stream chip from "By Course" — matches `courses` text and common synonyms. */
export function rowMatchesCourseKeyword(c: CollegeRow, keywordRaw: string): boolean {
  const k = normalizeSearch(keywordRaw);
  if (!k) return true;
  const courses = normalizeSearch(c.courses);
  const name = normalizeSearch(c.name);
  if (courses.includes(k) || name.includes(k)) return true;
  const eng =
    k.includes("btech") ||
    k.includes("b tech") ||
    k === "be" ||
    k.includes("engineering") ||
    k.includes("b e");
  if (eng) {
    const cLow = c.courses.toLowerCase();
    const nLow = c.name.toLowerCase();
    if (cLow.includes("b.tech") || cLow.includes("btech") || nLow.includes("engineering") || nLow.includes("technology")) return true;
  }
  return false;
}

/** Exam chip from "By Exam" — matches primary `accept` text (substring, case-insensitive). */
export function rowMatchesAcceptExam(c: CollegeRow, examRaw: string): boolean {
  const e = normalizeSearch(examRaw);
  if (!e) return true;
  const a = normalizeSearch(c.accept);
  if (a.includes(e)) return true;
  if (e.includes("neet") && a.includes("neet")) return true;
  if (e.includes("jee") && (a.includes("jee") || a.includes("josaa"))) return true;
  if (e.includes("cuet") && a.includes("cuet")) return true;
  return false;
}

export function rowMatchesStructuredFilters(c: CollegeRow, opts: Pick<CollegeQuery, "course" | "exam">): boolean {
  if (opts.course && !rowMatchesCourseKeyword(c, opts.course)) return false;
  if (opts.exam && !rowMatchesAcceptExam(c, opts.exam)) return false;
  return true;
}

export function queryColleges(opts: CollegeQuery): { items: CollegeRow[]; total: number } {
  const { page, pageSize, state, district, q, course, exam } = opts;
  const all = getAllColleges();
  const filtered = all.filter((c) => {
    if (state && c.state !== state) return false;
    if (district && c.district !== district) return false;
    if (!rowMatchesStructuredFilters(c, { course, exam })) return false;
    return matchesNeedle(c, q ?? "");
  });
  const total = filtered.length;
  const start = Math.max(0, (page - 1) * pageSize);
  const items = filtered.slice(start, start + pageSize);
  return { items, total };
}

/** Used by CSV merge layer — same matching rules as the synthetic `queryColleges` filter. */
export function rowMatchesQuery(c: CollegeRow, q: string): boolean {
  return matchesNeedle(c, q ?? "");
}

/** Approximate total rows (for UI copy); derived from geo + slots. */
export function approximateCollegeCount(): number {
  return getAllColleges().length;
}
