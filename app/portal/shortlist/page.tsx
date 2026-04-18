import Link from "next/link";
import { SavedClient } from "@/app/colleges/saved/SavedClient";

export default function PortalShortlistPage() {
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
        Shortlist
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 15, lineHeight: 1.55, maxWidth: 720 }}>
        Colleges you saved from the directory (browser + account when signed in). Compare up to three side-by-side or export a CSV for offline planning.
      </p>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: 20,
        }}
      >
        <SavedClient variant="portal" />
      </div>
      <p style={{ marginTop: 20, fontSize: 13, color: "#64748B" }}>
        <Link href="/#section-explore" style={{ color: "#D97706", fontWeight: 600 }}>
          Browse colleges on the home page
        </Link>{" "}
        to add more.
      </p>
    </main>
  );
}
