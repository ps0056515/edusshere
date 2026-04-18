import { auth } from "@/auth";

export default async function PortalAccountPage() {
  const session = await auth();
  const u = session?.user;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 48px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          margin: "0 0 8px",
          color: "#0F172A",
        }}
      >
        Account
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 15, lineHeight: 1.55 }}>
        Signed-in profile used for shortlist sync, application tracker, and portal imports.
      </p>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: 20,
          fontSize: 15,
          color: "#0F172A",
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".04em" }}>Email</div>
          <div style={{ marginTop: 4 }}>{u?.email ?? "—"}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".04em" }}>Name</div>
          <div style={{ marginTop: 4 }}>{u?.name ?? "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".04em" }}>User id</div>
          <div style={{ marginTop: 4, fontFamily: "ui-monospace, monospace", fontSize: 13, wordBreak: "break-all" }}>{u?.id ?? "—"}</div>
        </div>
      </div>
      <p style={{ marginTop: 20, fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
        Notification preferences and extra security options are not configured in this demo build. Use <strong>Sign out</strong> in the header when you
        finish on a shared device.
      </p>
    </main>
  );
}
