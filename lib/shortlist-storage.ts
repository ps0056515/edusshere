export const SHORTLIST_LS_KEY = "edusphere_shortlist_v1";

export type ShortlistEntry = { id: string; name: string };

export function readShortlistFromStorage(): ShortlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHORTLIST_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is ShortlistEntry => typeof x === "object" && x !== null && typeof (x as ShortlistEntry).id === "string")
      .map((x) => ({ id: (x as ShortlistEntry).id, name: String((x as ShortlistEntry).name ?? "") }));
  } catch {
    return [];
  }
}

export function writeShortlistToStorage(items: ShortlistEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHORTLIST_LS_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    /* quota / private mode */
  }
}

export function toggleShortlistInStorage(id: string, name: string): ShortlistEntry[] {
  const cur = readShortlistFromStorage();
  const exists = cur.some((x) => x.id === id);
  const next = exists ? cur.filter((x) => x.id !== id) : [...cur, { id, name }].slice(0, 200);
  writeShortlistToStorage(next);
  return next;
}

export function removeShortlistFromStorage(id: string): ShortlistEntry[] {
  const next = readShortlistFromStorage().filter((x) => x.id !== id);
  writeShortlistToStorage(next);
  return next;
}
