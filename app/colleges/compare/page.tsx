import Link from "next/link";
import { CompareClient } from "./CompareClient";

export default function ComparePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/#section-explore" style={{ fontSize: 14, color: "#64748B" }}>
          ← Back to colleges
        </Link>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "#0F172A", marginTop: 16, marginBottom: 8 }}>
          Compare colleges
        </h1>
        <p style={{ color: "#64748B", marginBottom: 24, maxWidth: 640, lineHeight: 1.55 }}>
          Side-by-side view of up to three institutions. Add colleges from the home list with <strong>+ Compare</strong>, then use{" "}
          <strong>Compare now</strong> in the bar at the bottom.
        </p>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            padding: 20,
          }}
        >
          <CompareClient />
        </div>
      </div>
    </div>
  );
}
