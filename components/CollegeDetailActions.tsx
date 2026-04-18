"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { compareQueueToHref, readCompareQueue, toggleCompareQueue } from "@/lib/compare-queue";
import {
  readShortlistFromStorage,
  toggleShortlistInStorage,
  writeShortlistToStorage,
  type ShortlistEntry,
} from "@/lib/shortlist-storage";

const C = {
  navy: "#0B1120",
  amber: "#F59E0B",
  amberDark: "#D97706",
  white: "#FFFFFF",
  slateLight: "#94A3B8",
  border: "rgba(255,255,255,.2)",
} as const;

export function CollegeDetailActions({ collegeId, collegeName }: { collegeId: string; collegeName: string }) {
  const { data: session, status } = useSession();
  const [saved, setSaved] = useState(false);
  const [compareQ, setCompareQ] = useState<{ id: string; name: string }[]>([]);

  const refresh = useCallback(() => {
    setSaved(readShortlistFromStorage().some((x) => x.id === collegeId));
    setCompareQ(readCompareQueue());
  }, [collegeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleSave = async () => {
    const wasInList = readShortlistFromStorage().some((x) => x.id === collegeId);
    const next = toggleShortlistInStorage(collegeId, collegeName);
    setSaved(next.some((x) => x.id === collegeId));
    if (status === "authenticated" && session?.user) {
      try {
        if (wasInList) {
          await fetch(`/api/shortlist?collegeId=${encodeURIComponent(collegeId)}`, { method: "DELETE", credentials: "include" });
        } else {
          await fetch("/api/shortlist", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collegeId, collegeName }),
          });
        }
      } catch {
        /* ignore */
      }
    }
  };

  const mergeServerShortlist = useCallback(
    async (local: ShortlistEntry[]) => {
      if (status !== "authenticated" || !session?.user) return;
      try {
        const res = await fetch("/api/shortlist", { credentials: "include" });
        const data = (await res.json()) as { items?: { collegeId: string; collegeName: string }[] };
        const merged = new Map<string, string>();
        local.forEach((x) => merged.set(x.id, x.name));
        data.items?.forEach((x) => merged.set(x.collegeId, x.collegeName || "Saved college"));
        const arr = [...merged.entries()].map(([id, name]) => ({ id, name }));
        writeShortlistToStorage(arr);
        setSaved(arr.some((x) => x.id === collegeId));
      } catch {
        /* ignore */
      }
    },
    [status, session?.user],
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    void mergeServerShortlist(readShortlistFromStorage());
  }, [status, mergeServerShortlist]);

  const toggleCompare = () => {
    const next = toggleCompareQueue(collegeId, collegeName);
    setCompareQ(next);
  };

  const inCompare = compareQ.some((x) => x.id === collegeId);
  const compareHref = compareQueueToHref(compareQ);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <button
        type="button"
        onClick={() => void toggleSave()}
        style={{
          padding: "12px 22px",
          borderRadius: 12,
          border: `1.5px solid ${saved ? C.amber : C.border}`,
          background: saved ? C.amber : "transparent",
          color: saved ? C.navy : C.white,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {saved ? "★ Saved" : "Save to shortlist"}
      </button>
      <button
        type="button"
        onClick={toggleCompare}
        style={{
          padding: "12px 22px",
          borderRadius: 12,
          border: `1.5px solid ${inCompare ? C.amber : C.border}`,
          background: inCompare ? "rgba(245,158,11,.2)" : "transparent",
          color: C.white,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {inCompare ? "✓ In compare queue" : "+ Compare queue"}
      </button>
      {compareHref && (
        <Link
          href={compareHref}
          style={{
            padding: "12px 22px",
            borderRadius: 12,
            background: C.amber,
            color: C.navy,
            fontWeight: 800,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Open compare ({compareQ.length})
        </Link>
      )}
      <Link
        href="/#section-explore"
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          color: C.slateLight,
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        Browse directory
      </Link>
    </div>
  );
}
