import Link from "next/link";

const card = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 14,
  padding: 20,
} as const;

export default function PortalPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 48px" }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, margin: "0 0 8px", color: "#0F172A" }}>
        Welcome back
      </h1>
      <p style={{ margin: "0 0 28px", color: "#64748B", fontSize: 15 }}>
        Your personalised workspace for shortlists, applications, and AI counselling.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <Link href="/portal/import" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ ...card, cursor: "pointer", borderColor: "#F59E0B", boxShadow: "0 0 0 1px rgba(245,158,11,.25)" }}>
            <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Import colleges (CSV)</div>
            <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.55 }}>
              Upload a CSV to add real institutions (e.g. Dayananda Sagar) — merged into the public college directory.
            </div>
            <div style={{ marginTop: 14, fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>Open importer →</div>
          </div>
        </Link>
        {[
          {
            href: "/portal/shortlist",
            t: "Shortlists",
            d: "Save and compare colleges across exams and cities. Export CSV or open side-by-side compare.",
            cta: "Open shortlist →",
          },
          {
            href: "/portal/applications",
            t: "Applications",
            d: "Track deadlines, status, and notes for each institute or form — private to your account.",
            cta: "Open tracker →",
          },
          {
            href: "/?counsellor=1",
            t: "AI counsellor",
            d: "Continue on the home page with server-backed chat (configure OPENAI_API_KEY for live models).",
            cta: "Open counsellor →",
          },
          {
            href: "/portal/account",
            t: "Account",
            d: "View the email and user id on this session. Sign out from the portal header when needed.",
            cta: "View account →",
          },
        ].map((x) => (
          <Link key={x.t} href={x.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ ...card, cursor: "pointer", height: "100%" }}>
              <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{x.t}</div>
              <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.55 }}>{x.d}</div>
              <div style={{ marginTop: 14, fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>{x.cta}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
