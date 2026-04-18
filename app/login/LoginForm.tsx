"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_LOGIN_PASSWORD, DEMO_LOGIN_USERNAME } from "@/lib/demo-login";

const C = {
  navy: "#0B1120",
  navyMid: "#0F172A",
  slateLight: "#94A3B8",
  amber: "#F59E0B",
  amberDark: "#D97706",
  border: "#E2E8F0",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
};

function LoginInner({
  googleEnabled,
  demoLoginEnabled,
}: {
  googleEnabled: boolean;
  demoLoginEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/portal";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        retryAfterSec?: number;
        devHint?: string;
      };
      if (!res.ok) {
        setError(
          data.retryAfterSec ? `Wait ${data.retryAfterSec}s before resending.` : data.error ?? "Could not send code.",
        );
        setLoading(false);
        return;
      }
      setStep("code");
      setMessage(data.devHint ?? "Check your email for the code. (In dev, see the server terminal.)");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const signInDemo = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const result = await signIn("demo-login", {
        username: DEMO_LOGIN_USERNAME,
        password: DEMO_LOGIN_PASSWORD,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Demo sign-in is not available.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Sign-in failed");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const result = await signIn("email-otp", {
        email,
        code,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid or expired code.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Sign-in failed");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(165deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: C.white,
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: C.slateLight }}>
            ← Back to EduSphere
          </Link>
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 26,
            margin: "0 0 8px",
            color: C.navyMid,
          }}
        >
          Sign in
        </h1>
        <p style={{ margin: "0 0 24px", color: C.slateLight, fontSize: 14, lineHeight: 1.5 }}>
          {demoLoginEnabled
            ? "Use Google SSO, a one-time email code, or the built-in demo account below."
            : "Use Google SSO or a one-time code sent to your email."}
        </p>

        {demoLoginEnabled && (
          <>
            <button
              type="button"
              onClick={signInDemo}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `1.5px dashed ${C.amberDark}`,
                background: "#FFFBEB",
                color: C.navyMid,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                marginBottom: 8,
              }}
            >
              {loading ? "Signing in…" : "Sign in as Demo (Demo / Demo123)"}
            </button>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: C.slateLight, lineHeight: 1.45 }}>
              Username <code style={{ color: C.navyMid }}>{DEMO_LOGIN_USERNAME}</code> · Password{" "}
              <code style={{ color: C.navyMid }}>{DEMO_LOGIN_PASSWORD}</code>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px" }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.slateLight, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
          </>
        )}

        {googleEnabled && (
          <>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.white,
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span>Continue with Google</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.slateLight, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
          </>
        )}

        {!googleEnabled && (
          <p
            style={{
              fontSize: 12,
              color: "#B45309",
              background: "#FEF3C7",
              padding: 10,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            Google SSO is disabled until <code>AUTH_GOOGLE_ID</code> and <code>AUTH_GOOGLE_SECRET</code> are set. Email
            OTP still works.
          </p>
        )}

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navyMid, marginBottom: 6 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step === "code"}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            marginBottom: 14,
            fontSize: 15,
            boxSizing: "border-box",
          }}
        />

        {step === "code" && (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navyMid, marginBottom: 6 }}>
              6-digit code
            </label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                marginBottom: 14,
                fontSize: 18,
                letterSpacing: 4,
                boxSizing: "border-box",
              }}
            />
          </>
        )}

        {error && <p style={{ color: "#B91C1C", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
        {message && <p style={{ color: "#047857", fontSize: 13, margin: "0 0 12px" }}>{message}</p>}

        {step === "email" ? (
          <button
            type="button"
            onClick={sendOtp}
            disabled={loading || !email.includes("@")}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: C.amber,
              color: C.navy,
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Sending…" : "Send one-time code"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setMessage(null);
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                background: C.offWhite,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Edit email
            </button>
            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading || code.length !== 6}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: C.amberDark,
                color: C.white,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Verifying…" : "Verify & sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoginForm({
  googleEnabled,
  demoLoginEnabled,
}: {
  googleEnabled: boolean;
  demoLoginEnabled: boolean;
}) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0F172A" }} />}>
      <LoginInner googleEnabled={googleEnabled} demoLoginEnabled={demoLoginEnabled} />
    </Suspense>
  );
}
