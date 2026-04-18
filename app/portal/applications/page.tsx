import { ApplicationsClient } from "./ApplicationsClient";

export default function PortalApplicationsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 48px" }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          margin: "0 0 8px",
          color: "#0F172A",
        }}
      >
        Application tracker
      </h1>
      <p style={{ margin: "0 0 28px", color: "#64748B", fontSize: 15, lineHeight: 1.55, maxWidth: 720 }}>
        Track deadlines and status for each college or form you care about. Data is stored on your account and is not shared with colleges automatically.
      </p>
      <ApplicationsClient />
    </main>
  );
}
