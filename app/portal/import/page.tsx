import Link from "next/link";
import { ImportCsvForm } from "./ImportCsvForm";

export default function ImportCollegesPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 48px" }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, color: "#0F172A", margin: "0 0 8px" }}>
        Import colleges from CSV
      </h1>
      <p style={{ color: "#64748B", marginBottom: 20, lineHeight: 1.6 }}>
        Upload a UTF-8 CSV to add real colleges on top of the demo directory. Rows are stored in Postgres and merged into search and listings.
        Imports override synthetic rows when the same name, state, and district are detected (case-insensitive).
      </p>
      <p style={{ marginBottom: 20 }}>
        <a
          href="/sample-colleges-import.csv"
          download
          style={{ color: "#0D9488", fontWeight: 600 }}
        >
          Download sample CSV
        </a>
      </p>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#0F172A" }}>Required columns</h2>
        <p style={{ fontSize: 14, color: "#64748B", marginBottom: 12 }}>
          Header row required. <strong>name</strong> (or <code>college_name</code> / <code>institution</code>) is required. Optional:{" "}
          <code>state</code>, <code>district</code>, <code>city</code>, <code>type</code>, <code>rating</code>, <code>fees</code>,{" "}
          <code>naac</code>, <code>placements</code>, <code>accept</code>, <code>courses</code>.
        </p>
        <ImportCsvForm />
      </div>
      <Link href="/portal" style={{ color: "#F59E0B", fontWeight: 600 }}>
        ← Back to dashboard
      </Link>
    </main>
  );
}
