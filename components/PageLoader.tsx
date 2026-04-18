/**
 * Full-page and inline loading UI (uses `/brand-loader.svg` + CSS ring).
 * Use in `app/loading.tsx` or inside client sections while data fetches.
 */
export function PageLoader({
  message = "Loading…",
  inline = false,
}: {
  message?: string;
  /** Shorter block for embedding (e.g. college grid). */
  inline?: boolean;
}) {
  return (
    <div className={inline ? "es-pl es-pl--inline" : "es-pl"} role="status" aria-live="polite">
      <div className="es-pl__spinwrap">
        <div className="es-pl__ring" aria-hidden />
        <img className="es-pl__img" src="/brand-loader.svg" width={80} height={80} alt="" />
      </div>
      <p className="es-pl__msg">{message}</p>
    </div>
  );
}
