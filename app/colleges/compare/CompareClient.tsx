"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type CollegeApi = {
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
  courses: string;
};

const fields: { key: keyof CollegeApi; label: string }[] = [
  { key: "name", label: "College" },
  { key: "district", label: "District" },
  { key: "state", label: "State" },
  { key: "type", label: "Type" },
  { key: "fees", label: "Tuition (indicative)" },
  { key: "naac", label: "NAAC" },
  { key: "placements", label: "Placements (avg)" },
  { key: "accept", label: "Entrance accepted" },
  { key: "courses", label: "Courses" },
  { key: "rating", label: "Rating" },
  { key: "rank", label: "List rank" },
];

function CompareInner() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const [items, setItems] = useState<CollegeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idsList = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (idsList.length < 2) {
      setLoading(false);
      setItems([]);
      setError(idsList.length === 0 ? "Add at least two colleges from the list, then open Compare again." : "Add one more college to compare.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const u = new URL("/api/colleges/compare", window.location.origin);
        for (const id of idsList) u.searchParams.append("id", id);
        const res = await fetch(u.toString());
        const data = (await res.json()) as { items?: CollegeApi[]; error?: string };
        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Could not load colleges.");
          return;
        }
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        if (!cancelled) setError("Network error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idsParam]);

  if (loading) {
    return <p style={{ color: "#64748B" }}>Loading comparison…</p>;
  }
  if (error || items.length < 2) {
    return (
      <div>
        <p style={{ color: "#B91C1C", marginBottom: 16 }}>{error ?? "Need at least two valid colleges."}</p>
        <Link href="/#section-explore" style={{ color: "#D97706", fontWeight: 600 }}>
          ← Back to explore
        </Link>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 520 }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "12px 10px",
                borderBottom: "2px solid #E2E8F0",
                color: "#64748B",
                width: 140,
              }}
            >
              Field
            </th>
            {items.map((c) => (
              <th
                key={c.id}
                style={{
                  textAlign: "left",
                  padding: "12px 10px",
                  borderBottom: "2px solid #E2E8F0",
                  color: "#0F172A",
                  minWidth: 200,
                  verticalAlign: "bottom",
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <Link href={`/colleges/detail?id=${encodeURIComponent(c.id)}`} style={{ fontSize: 12, color: "#D97706", fontWeight: 600 }}>
                  View detail
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((row) => (
            <tr key={row.key}>
              <td style={{ padding: "10px", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600 }}>{row.label}</td>
              {items.map((c) => (
                <td key={c.id + row.key} style={{ padding: "10px", borderBottom: "1px solid #E2E8F0", color: "#0F172A", verticalAlign: "top" }}>
                  {row.key === "rating" ? `⭐ ${c.rating}` : String(c[row.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompareClient() {
  return (
    <Suspense fallback={<p style={{ color: "#64748B" }}>Loading…</p>}>
      <CompareInner />
    </Suspense>
  );
}
