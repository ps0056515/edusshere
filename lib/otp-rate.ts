const lastSend = new Map<string, number>();
const COOLDOWN_MS = 45_000;

export function canSendOtp(email: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const prev = lastSend.get(email) ?? 0;
  const elapsed = now - prev;
  if (elapsed < COOLDOWN_MS) {
    return { ok: false, retryAfterSec: Math.ceil((COOLDOWN_MS - elapsed) / 1000) };
  }
  lastSend.set(email, now);
  return { ok: true };
}
