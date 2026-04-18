/** Cross-page compare queue (e.g. detail → detail → compare). Max 3 IDs. */

export const COMPARE_QUEUE_KEY = "edusphere_compare_queue_v1";

export type CompareQueueEntry = { id: string; name: string };

export function readCompareQueue(): CompareQueueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(COMPARE_QUEUE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p
      .filter((x): x is CompareQueueEntry => typeof x === "object" && x !== null && typeof (x as CompareQueueEntry).id === "string")
      .map((x) => ({ id: String((x as CompareQueueEntry).id), name: String((x as CompareQueueEntry).name ?? "") }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export function writeCompareQueue(entries: CompareQueueEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const seen = new Set<string>();
    const next: CompareQueueEntry[] = [];
    for (const e of entries) {
      const id = e.id.trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      next.push({ id, name: e.name.slice(0, 200) });
      if (next.length >= 3) break;
    }
    window.sessionStorage.setItem(COMPARE_QUEUE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function toggleCompareQueue(id: string, name: string): CompareQueueEntry[] {
  const cur = readCompareQueue();
  const exists = cur.some((x) => x.id === id);
  const next = exists ? cur.filter((x) => x.id !== id) : [...cur, { id, name }].slice(0, 3);
  writeCompareQueue(next);
  return next;
}

export function compareQueueToHref(entries: CompareQueueEntry[]): string | null {
  if (entries.length < 2) return null;
  const ids = entries
    .slice(0, 3)
    .map((e) => e.id)
    .join(",");
  return `/colleges/compare?ids=${encodeURIComponent(ids)}`;
}

export function clearCompareQueue(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(COMPARE_QUEUE_KEY);
  } catch {
    /* ignore */
  }
}
