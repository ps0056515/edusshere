"use client";

import { useState } from "react";

const C = {
  navyMid: "#0F172A",
  slateLight: "#94A3B8",
  border: "#E2E8F0",
  amber: "#F59E0B",
  amberDark: "#D97706",
  white: "#FFFFFF",
};

type Props = {
  collegeId?: string;
  collegeName?: string;
  variant?: "compact" | "card";
};

export function GuidanceLeadForm({ collegeId, collegeName, variant = "card" }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errText, setErrText] = useState("");

  const submit = async () => {
    setStatus("loading");
    setErrText("");
    try {
      const res = await fetch("/api/guidance-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          message,
          collegeId,
          collegeName,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrText(data.error ?? "Something went wrong.");
        setStatus("err");
        return;
      }
      setStatus("ok");
      setMessage("");
    } catch {
      setErrText("Network error.");
      setStatus("err");
    }
  };

  if (variant === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: C.amber,
            color: C.navyMid,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Get guidance
        </button>
        {open && (
          <Modal
            onClose={() => {
              setOpen(false);
              setStatus("idle");
            }}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            message={message}
            setMessage={setMessage}
            status={status}
            errText={errText}
            submit={submit}
            collegeName={collegeName}
          />
        )}
      </>
    );
  }

  return (
    <div
      style={{
        marginTop: 28,
        padding: 22,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        background: "#FFFBEB",
      }}
    >
      <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>Talk to a counsellor</h2>
      <p style={{ fontSize: 14, color: C.slateLight, marginBottom: 16, lineHeight: 1.5 }}>
        Leave your details and what you are looking for. Our team will reach out (demo: stored in the database).
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={inp}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={inp}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          style={inp}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What help do you need? (e.g. shortlist, fees, exams)"
          rows={4}
          style={{ ...inp, resize: "vertical" as const }}
        />
        {errText && <p style={{ color: "#B91C1C", fontSize: 13 }}>{errText}</p>}
        {status === "ok" && <p style={{ color: "#047857", fontSize: 13 }}>Thanks — we will get back to you.</p>}
        <button
          type="button"
          onClick={submit}
          disabled={status === "loading"}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            background: C.amberDark,
            color: C.white,
            fontWeight: 700,
            cursor: status === "loading" ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {status === "loading" ? "Sending…" : "Request callback"}
        </button>
      </div>
    </div>
  );
}

const inp: Record<string, string | number> = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1.5px solid ${C.border}`,
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

function Modal({
  onClose,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  message,
  setMessage,
  status,
  errText,
  submit,
  collegeName,
}: {
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  status: string;
  errText: string;
  submit: () => void;
  collegeName?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: 24,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>Get guidance</h3>
        {collegeName && (
          <p style={{ fontSize: 13, color: C.slateLight, marginBottom: 12 }}>
            About: <strong style={{ color: C.navyMid }}>{collegeName}</strong>
          </p>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inp} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inp} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" style={inp} />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={3} style={{ ...inp, resize: "vertical" as const }} />
        </div>
        {errText && <p style={{ color: "#B91C1C", fontSize: 13, marginTop: 10 }}>{errText}</p>}
        {status === "ok" && <p style={{ color: "#047857", fontSize: 13, marginTop: 10 }}>Thanks! We will be in touch.</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "#F8FAFC", cursor: "pointer", fontFamily: "inherit" }}>
            Close
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={status === "loading"}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: C.amber,
              fontWeight: 700,
              cursor: status === "loading" ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
