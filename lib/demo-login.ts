/** Built-in demo portal credentials (see `demo-login` provider in `auth.ts`). */
export const DEMO_LOGIN_USERNAME = "Demo";
export const DEMO_LOGIN_PASSWORD = "Demo123";
export const DEMO_USER_EMAIL = "demo@edusphere.local";

/** Demo sign-in is on in development; in production set `ENABLE_DEMO_LOGIN=1` or it stays off. */
export function isDemoLoginEnabled(): boolean {
  if (process.env.ENABLE_DEMO_LOGIN === "0") return false;
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_LOGIN === "1";
}
