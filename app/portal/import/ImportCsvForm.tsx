"use client";

import { useState } from "react";

export function ImportCsvForm() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("uploading");
    setMessage(null);
    setDetail(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      setStatus("error");
      setMessage("Choose a CSV file first.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setStatus("error");
      setMessage("File must be a .csv file.");
      return;
    }
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/colleges/import", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; imported?: number; skipped?: number; errors?: string[]; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Upload failed.");
        setDetail(data.errors?.join("\n") ?? null);
        return;
      }
      setStatus("done");
      setMessage(`Imported ${data.imported ?? 0} row(s). Skipped ${data.skipped ?? 0}.`);
      if (data.errors?.length) setDetail(data.errors.slice(0, 20).join("\n"));
      input.value = "";
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#0F172A" }}>CSV file</label>
      <input
        name="file"
        type="file"
        accept=".csv,text/csv"
        required
        style={{ marginBottom: 16, fontSize: 14 }}
      />
      <button
        type="submit"
        disabled={status === "uploading"}
        style={{
          background: "#F59E0B",
          color: "#0B1120",
          border: "none",
          padding: "12px 22px",
          borderRadius: 10,
          fontWeight: 700,
          cursor: status === "uploading" ? "wait" : "pointer",
        }}
      >
        {status === "uploading" ? "Uploading…" : "Upload & merge"}
      </button>
      {message && (
        <p style={{ marginTop: 16, color: status === "error" ? "#B91C1C" : "#047857", fontSize: 14, whiteSpace: "pre-wrap" }}>
          {message}
        </p>
      )}
      {detail && (
        <pre style={{ marginTop: 10, fontSize: 12, color: "#64748B", overflow: "auto", maxHeight: 200 }}>{detail}</pre>
      )}
    </form>
  );
}
