"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type ApplicationRow = {
  id: string;
  collegeName: string;
  collegeId: string | null;
  program: string | null;
  deadline: string | null;
  status: string;
  notes: string | null;
  updatedAt: string;
};

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

function deadlineInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function ApplicationsClient() {
  const [items, setItems] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [formCollege, setFormCollege] = useState("");
  const [formProgram, setFormProgram] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formStatus, setFormStatus] = useState<string>("planned");
  const [formNotes, setFormNotes] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", { credentials: "include" });
      const data = (await res.json()) as { items?: ApplicationRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load applications.");
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Network error.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const collegeName = formCollege.trim();
    if (!collegeName || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName,
          program: formProgram.trim() || null,
          deadline: formDeadline || null,
          status: formStatus,
          notes: formNotes.trim() || null,
        }),
      });
      const data = (await res.json()) as { item?: ApplicationRow; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create.");
        return;
      }
      if (data.item) setItems((p) => [data.item!, ...p]);
      setFormCollege("");
      setFormProgram("");
      setFormDeadline("");
      setFormStatus("planned");
      setFormNotes("");
    } catch {
      setError("Network error.");
    } finally {
      setCreating(false);
    }
  };

  const patchRow = async (id: string, patch: Partial<ApplicationRow>) => {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as { item?: ApplicationRow; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      if (data.item) {
        setItems((p) => p.map((x) => (x.id === id ? data.item! : x)));
      }
    } catch {
      setError("Network error.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this application row?")) return;
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not delete.");
        return;
      }
      setItems((p) => p.filter((x) => x.id !== id));
    } catch {
      setError("Network error.");
    } finally {
      setSavingId(null);
    }
  };

  const inputStyle = {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      {error && (
        <p style={{ color: "#B45309", fontSize: 14, marginBottom: 16, padding: 12, background: "#FFFBEB", borderRadius: 10 }}>
          {error}
        </p>
      )}

      <form
        onSubmit={create}
        style={{
          marginBottom: 28,
          padding: 20,
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        <div style={{ gridColumn: "1 / -1", fontWeight: 700, color: "#0F172A" }}>Add application</div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>College / institute *</span>
          <input required value={formCollege} onChange={(e) => setFormCollege(e.target.value)} style={inputStyle} placeholder="e.g. IIT Madras" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Program (optional)</span>
          <input value={formProgram} onChange={(e) => setFormProgram(e.target.value)} style={inputStyle} placeholder="e.g. B.Tech CSE" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Deadline</span>
          <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Status</span>
          <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} style={inputStyle}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Notes</span>
          <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "#F59E0B",
              color: "#0B1120",
              fontWeight: 700,
              cursor: creating ? "wait" : "pointer",
            }}
          >
            {creating ? "Saving…" : "Add to tracker"}
          </button>
        </div>
      </form>

      {loading ? (
        <p style={{ color: "#64748B" }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: "#64748B" }}>
          No rows yet. Add deadlines for forms, counselling rounds, or fee payments — this is your private checklist.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748B", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".04em" }}>
                <th style={{ padding: 12, borderBottom: "1px solid #E2E8F0" }}>College</th>
                <th style={{ padding: 12, borderBottom: "1px solid #E2E8F0" }}>Program</th>
                <th style={{ padding: 12, borderBottom: "1px solid #E2E8F0" }}>Deadline</th>
                <th style={{ padding: 12, borderBottom: "1px solid #E2E8F0" }}>Status</th>
                <th style={{ padding: 12, borderBottom: "1px solid #E2E8F0" }} />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <ApplicationRowEditor
                  key={row.id}
                  row={row}
                  disabled={savingId === row.id}
                  onPatch={(patch) => void patchRow(row.id, patch)}
                  onDelete={() => void remove(row.id)}
                  inputStyle={inputStyle}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 13, color: "#64748B" }}>
        Tip: link a saved college from{" "}
        <Link href="/portal/shortlist" style={{ color: "#D97706", fontWeight: 600 }}>
          Shortlist
        </Link>{" "}
        by opening its detail page and copying the name here.
      </p>
    </div>
  );
}

function ApplicationRowEditor({
  row,
  disabled,
  onPatch,
  onDelete,
  inputStyle,
}: {
  row: ApplicationRow;
  disabled: boolean;
  onPatch: (patch: Partial<ApplicationRow>) => void;
  onDelete: () => void;
  inputStyle: Record<string, unknown>;
}) {
  const [localDeadline, setLocalDeadline] = useState(deadlineInputValue(row.deadline));
  const [localStatus, setLocalStatus] = useState(row.status);
  const [localNotes, setLocalNotes] = useState(row.notes ?? "");

  useEffect(() => {
    setLocalDeadline(deadlineInputValue(row.deadline));
    setLocalStatus(row.status);
    setLocalNotes(row.notes ?? "");
  }, [row.deadline, row.status, row.notes, row.updatedAt]);

  return (
    <tr>
      <td style={{ padding: 12, borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
        <div style={{ fontWeight: 600, color: "#0F172A" }}>{row.collegeName}</div>
        {row.collegeId && (
          <Link href={`/colleges/detail?id=${encodeURIComponent(row.collegeId)}`} style={{ fontSize: 12, color: "#D97706" }}>
            View profile
          </Link>
        )}
      </td>
      <td style={{ padding: 12, borderBottom: "1px solid #F1F5F9", verticalAlign: "top", color: "#475569" }}>{row.program ?? "—"}</td>
      <td style={{ padding: 12, borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
        <input
          type="date"
          disabled={disabled}
          value={localDeadline}
          onChange={(e) => setLocalDeadline(e.target.value)}
          onBlur={() => {
            const next = localDeadline || null;
            const prev = deadlineInputValue(row.deadline) || null;
            if (next !== prev) {
              onPatch({ deadline: next });
            }
          }}
          style={{ ...inputStyle, maxWidth: 160 }}
        />
      </td>
      <td style={{ padding: 12, borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
        <select
          disabled={disabled}
          value={localStatus}
          onChange={(e) => {
            const v = e.target.value;
            setLocalStatus(v);
            onPatch({ status: v });
          }}
          style={{ ...inputStyle, maxWidth: 160 }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td style={{ padding: 12, borderBottom: "1px solid #F1F5F9", verticalAlign: "top", whiteSpace: "nowrap" }}>
        <textarea
          disabled={disabled}
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={() => {
            const n = localNotes.trim();
            const p = (row.notes ?? "").trim();
            if (n !== p) onPatch({ notes: n || null });
          }}
          rows={2}
          placeholder="Docs, fees…"
          style={{ ...inputStyle, minWidth: 140, maxWidth: 220 }}
        />
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              color: "#991B1B",
              cursor: disabled ? "wait" : "pointer",
            }}
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}
