import type { CollegeRow } from "@/lib/colleges-index";

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Parse approximate average package in ₹L from strings like "₹12.5L avg". */
export function parsePlacementLakh(placements: string): number | null {
  const m = placements.replace(/,/g, "").match(/₹?\s*([\d.]+)\s*L/i);
  if (!m) return null;
  const v = parseFloat(m[1]!);
  return Number.isFinite(v) ? v : null;
}

export type DemoYearStat = {
  year: number;
  medianLakh: number;
  highestLakh: number;
  placedPct: number;
};

/** Deterministic multi-year series for UI exploration — not official placement data. */
export function buildDemoYearlyPlacement(college: CollegeRow): DemoYearStat[] {
  const base = parsePlacementLakh(college.placements) ?? 3.5 + (hash32(college.id + "pl") % 40) / 5;
  const years = [2024, 2023, 2022];
  return years.map((year, i) => {
    const j = (hash32(college.id + String(year)) % 24) / 10 - 1.1;
    const median = round1(Math.max(2.2, base + j - i * 0.35));
    const highest = round1(median * (2.1 + (hash32(college.id + "hi" + String(year)) % 15) / 20));
    const placedPct = Math.min(96, 58 + (hash32(college.id + "pct" + String(year)) % 38) - i * 2);
    return { year, medianLakh: median, highestLakh: highest, placedPct };
  });
}

/** Directory ordering only — not official NIRF rank. */
export function directoryRankBand(rank: number): { label: string; caption: string } {
  if (rank <= 0) {
    return {
      label: "CSV / import",
      caption: "This row came from an import and is not given a synthetic nationwide list position.",
    };
  }
  if (rank <= 50) return { label: "Top 50", caption: "Within the first fifty listings in this demo directory." };
  if (rank <= 200) return { label: "Top 200", caption: "Early segment of the nationwide demo ordering." };
  if (rank <= 1000) return { label: "Top 1,000", caption: "Upper tier of the demo index by list position." };
  if (rank <= 5000) return { label: "Top 5,000", caption: "Mid-upper segment of the demo index." };
  return { label: "Broad list", caption: "Further down the demo ordering — use filters to narrow peers." };
}

export function buildStrengths(college: CollegeRow): string[] {
  const out: string[] = [];
  const courses = college.courses.toLowerCase();
  if (courses.includes("b.tech") || courses.includes("engineering")) {
    out.push("Engineering & technology focus with core branches and emerging CS-aligned programmes.");
  }
  if (courses.includes("mbbs") || courses.includes("medical")) {
    out.push("Health sciences orientation — clinical and pre-clinical training pathways.");
  }
  if (courses.includes("mba") || courses.includes("law") || courses.includes("llb")) {
    out.push("Professional degree streams with structured exit pathways.");
  }
  if (college.naac.startsWith("A")) {
    out.push(`NAAC ${college.naac} band — typically signals stronger QA processes (verify current cycle).`);
  }
  if (college.type === "Government" || college.type === "Central") {
    out.push(`${college.type} institution — fee bands are often relatively controlled vs many private peers.`);
  }
  if (college.rating >= 4.2) {
    out.push("Higher in-directory rating vs average — compare with similar colleges in the same district.");
  }
  const exams = college.accept.split(/[,/&]/).map((s) => s.trim()).filter(Boolean);
  if (exams.length >= 2) {
    out.push(`Accepts multiple entrance routes (${exams.slice(0, 3).join(", ")}…) — flexibility for different student profiles.`);
  }
  if (out.length < 3) {
    out.push(`Located in ${college.district}, ${college.state} — weigh commute, climate, and local industry links for your stream.`);
  }
  return out.slice(0, 5);
}

export function buildProsCons(college: CollegeRow): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  if (college.naac.startsWith("A")) pros.push(`NAAC ${college.naac} — check the latest accreditation outcome on the official NAAC portal.`);
  else cons.push(`NAAC ${college.naac} — validate whether this meets your personal bar for quality assurance.`);

  if (college.type === "Private" || college.type === "Deemed") {
    cons.push("Private / deemed fee structures can shift year to year — read the official fee notice and refund rules.");
  }
  if (college.type === "Government" || college.type === "Central" || college.type === "State") {
    pros.push(`${college.type} governance can mean more predictable published fee norms — still confirm this year's notice.`);
  }

  pros.push("Entrance and programme mix is surfaced here — cross-check eligibility and domicile rules on the official prospectus.");

  cons.push("This page uses a demo directory: placement figures and trends are illustrative, not audited placement reports.");

  if (college.rating < 3.8) {
    cons.push("Lower in-directory rating vs top peers — dig into faculty, labs, and alumni outcomes for your branch.");
  } else {
    pros.push("Stronger in-directory rating — pair with a branch-level cutoff and alumni signal check.");
  }

  if (college.rank > 0) {
    pros.push(`List rank #${college.rank} is only relative to this site's demo index, not a government ranking.`);
  }

  return { pros: pros.slice(0, 5), cons: cons.slice(0, 5) };
}

export function parseFeesHint(fees: string): { annual: string; note: string } {
  const t = fees.trim();
  if (!t) return { annual: "—", note: "Contact the college for the latest fee structure." };
  return {
    annual: t,
    note: "Indicative annual tuition from the directory. Hostel, transport, and exam fees are usually extra.",
  };
}
