import Link from "next/link";
import { signOut } from "@/auth";

export default async function PortalChrome({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string | null | undefined;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <header
        style={{
          background: "#0F172A",
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0B1120",
              fontWeight: 800,
            }}
          >
            E
          </div>
          <span style={{ fontWeight: 700 }}>EduSphere Portal</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 14, flexWrap: "wrap" }}>
          <span style={{ color: "#94A3B8" }}>{email}</span>
          <Link href="/" style={{ color: "#94A3B8", fontWeight: 600, fontSize: 14 }}>
            Home
          </Link>
          <Link href="/portal/shortlist" style={{ color: "#94A3B8", fontWeight: 600, fontSize: 14 }}>
            Shortlist
          </Link>
          <Link href="/portal/applications" style={{ color: "#94A3B8", fontWeight: 600, fontSize: 14 }}>
            Applications
          </Link>
          <Link href="/portal" style={{ color: "#94A3B8", fontWeight: 600, fontSize: 14 }}>
            Dashboard
          </Link>
          <Link href="/portal/account" style={{ color: "#94A3B8", fontWeight: 600, fontSize: 14 }}>
            Account
          </Link>
          <Link href="/portal/import" style={{ color: "#94A3B8", fontWeight: 600, fontSize: 14 }}>
            Import colleges (CSV)
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,.25)",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
