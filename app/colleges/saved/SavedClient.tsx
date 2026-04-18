"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { readShortlistFromStorage, removeShortlistFromStorage, writeShortlistToStorage, type ShortlistEntry } from "@/lib/shortlist-storage";

function downloadShortlistCsv(rows: ShortlistEntry[]) {
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = ["id,name", ...rows.map((r) => `${esc(r.id)},${esc(r.name)}`)];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "edusphere-shortlist.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function SavedClient({ variant = "default" }: { variant?: "default" | "portal" }) {
  const { data: session, status } = useSession();
  const [localItems, setLocalItems] = useState<ShortlistEntry[]>([]);
  const [serverItems, setServerItems] = useState<ShortlistEntry[]>([]);

  const refreshLocal = useCallback(() => {
    setLocalItems(readShortlistFromStorage());
  }, []);

  useEffect(() => {
    refreshLocal();
  }, [refreshLocal]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/shortlist", { credentials: "include" });
        const data = (await res.json()) as { items?: { collegeId: string; collegeName: string }[] };
        if (cancelled) return;
        const mapped =
          data.items?.map((x) => ({
            id: x.collegeId,
            name: x.collegeName || "Saved college",
          })) ?? [];
        setServerItems(mapped);
        const merged = new Map<string, string>();
        readShortlistFromStorage().forEach((x) => merged.set(x.id, x.name));
        mapped.forEach((x) => merged.set(x.id, x.name));
        writeShortlistToStorage([...merged.entries()].map(([id, name]) => ({ id, name })));
        refreshLocal();
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user, refreshLocal]);

  const remove = async (id: string) => {
    removeShortlistFromStorage(id);
    refreshLocal();
    if (status === "authenticated") {
      try {
        await fetch(`/api/shortlist?collegeId=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      } catch {
        /* ignore */
      }
      setServerItems((p) => p.filter((x) => x.id !== id));
    }
  };

  const mergedMap = new Map<string, string>();
  serverItems.forEach((x) => mergedMap.set(x.id, x.name));
  localItems.forEach((x) => mergedMap.set(x.id, x.name));
  const merged = [...mergedMap.entries()].map(([id, name]) => ({ id, name }));

  const compareHref =
    merged.length >= 2
      ? `/colleges/compare?ids=${encodeURIComponent(
          merged
            .slice(0, 3)
            .map((x) => x.id)
            .join(","),
        )}`
      : "";

  return (
    <div>
      {status === "authenticated" && (
        <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
          Signed in: shortlist syncs to your account when you save from the college list.
        </p>
      )}
      {variant === "portal" && merged.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
          {merged.length >= 2 && (
            <Link
              href={compareHref}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: "#F59E0B",
                color: "#0B1120",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Compare first {Math.min(3, merged.length)} in directory
            </Link>
          )}
          <button
            type="button"
            onClick={() => downloadShortlistCsv(merged)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#0F172A",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
        </div>
      )}
      {merged.length === 0 ? (
        <p style={{ color: "#64748B" }}>
          No saved colleges yet. Use <strong>Save</strong> on a college card on the home page.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {merged.map((x) => (
            <li
              key={x.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 0",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <div>
                <Link href={`/colleges/detail?id=${encodeURIComponent(x.id)}`} style={{ fontWeight: 600, color: "#0F172A" }}>
                  {x.name || "College"}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => remove(x.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
