import Link from "next/link";
import { SavedClient } from "./SavedClient";

export default function SavedCollegesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Link href="/#section-explore" style={{ fontSize: 14, color: "#64748B" }}>
          ← Back to colleges
        </Link>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "#0F172A", marginTop: 16, marginBottom: 8 }}>
          Saved colleges
        </h1>
        <p style={{ color: "#64748B", marginBottom: 24, lineHeight: 1.55 }}>
          Your shortlist is stored in this browser. When you are logged in, saves also sync to your account.
        </p>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
          <SavedClient />
        </div>
      </div>
    </div>
  );
}
