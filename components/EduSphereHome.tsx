"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearCompareQueue, readCompareQueue, writeCompareQueue } from "@/lib/compare-queue";
import { useRouter, useSearchParams } from "next/navigation";
import { GuidanceLeadForm } from "@/components/GuidanceLeadForm";
import { PageLoader } from "@/components/PageLoader";
import { INDIA_STATES_AND_UTS, type IndiaState, listDistrictsForState } from "@/lib/india-geo";
import {
  readShortlistFromStorage,
  toggleShortlistInStorage,
  writeShortlistToStorage,
  type ShortlistEntry,
} from "@/lib/shortlist-storage";

type CollegeApi = {
  id: string;
  name: string;
  state: string;
  district: string;
  city: string;
  type: string;
  rating: number;
  rank: number;
  fees: string;
  naac: string;
  placements: string;
  accept: string;
  courses: string;
};

type CompareEntry = { id: string; name: string };

const EXAMS = ["JEE Main", "JEE Advanced", "NEET UG", "CAT", "GATE", "CUET", "CLAT", "BITSAT"];
const COURSES_LIST = ["B.Tech", "MBA", "MBBS", "B.Com", "BA", "BBA", "M.Tech", "MCA", "LLB", "B.Sc"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur"];

const STATS = [
  { num: "30000", label: "Colleges Listed", suffix: "+" },
  { num: "500", label: "Exams Covered", suffix: "+" },
  { num: "2000000", label: "Pages Indexed", suffix: "+" },
  { num: "10000000", label: "Students Guided", suffix: "+" },
];

const SEO_CONFIG = {
  models: ["Claude Sonnet 4", "Claude Opus 4", "GPT-4o", "Gemini 2.0 Pro"],
  tones: ["Professional", "Student-Friendly", "Conversational", "Academic"],
  seoLevels: ["Low (Natural)", "Medium (Balanced)", "High (Keyword-Dense)"],
  languages: ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali"],
};

type AiCfg = {
  model: string;
  tone: string;
  seo: string;
  auto: boolean;
  lang: string;
  refresh: string;
};

type AiFieldKey = Exclude<keyof AiCfg, "auto">;

type ChatMsg = { role: "ai" | "user"; text: string };

const AI_CFG_STORAGE_KEY = "edusphere_ai_cfg_v1";

function AnimCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVis(true);
    }, { threshold: 0.3 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    if (!vis) return;
    const n = parseInt(target, 10);
    const step = Math.ceil(n / 50);
    let c = 0;
    const t = setInterval(() => {
      c += step;
      if (c >= n) {
        c = n;
        clearInterval(t);
      }
      setCount(c);
    }, 25);
    return () => clearInterval(t);
  }, [vis, target]);
  const fmt =
    count >= 1000000 ? `${(count / 1000000).toFixed(0)}M` : count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count.toString();
  return (
    <span ref={ref}>
      {fmt}
      {suffix}
    </span>
  );
}

const C = {
  navy: "#0B1120",
  navyMid: "#0F172A",
  navyLight: "#1E293B",
  slate: "#334155",
  slateLight: "#94A3B8",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  cream: "#FFFBF0",
  amber: "#F59E0B",
  amberDark: "#D97706",
  amberLight: "#FEF3C7",
  teal: "#10B981",
  tealLight: "#D1FAE5",
  tealDark: "#059669",
  border: "#E2E8F0",
  borderDark: "#1E293B",
};

function courseCount(idx: number) {
  return ((idx * 137 + 503) % 2800) + 500;
}

function cityCount(idx: number) {
  return ((idx * 211 + 101) % 400) + 100;
}

export default function EduSphereHome() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("colleges");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    {
      role: "ai",
      text: "Hi! I'm EduSphere AI. Share your exam, expected score, preferred city, and budget — I'll recommend the best colleges for you.",
    },
  ]);
  const [chatIn, setChatIn] = useState("");
  const [aiCfg, setAiCfg] = useState<AiCfg>({
    model: "Claude Sonnet 4",
    tone: "Student-Friendly",
    seo: "Medium (Balanced)",
    auto: false,
    lang: "English",
    refresh: "Weekly",
  });
  const [chatSending, setChatSending] = useState(false);
  const [aiProviders, setAiProviders] = useState<{ openai: boolean; anthropic: boolean } | null>(null);
  const [compare, setCompare] = useState<CompareEntry[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const c = searchParams.get("counsellor");
    if (c !== "1" && c !== "true") return;
    const timer = window.setTimeout(() => {
      document.getElementById("ai-counsellor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  const [filterState, setFilterState] = useState<string>("");
  const [filterDistrict, setFilterDistrict] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [filterExam, setFilterExam] = useState<string>("");
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [collegePage, setCollegePage] = useState(1);
  const [collegeItems, setCollegeItems] = useState<CollegeApi[]>([]);
  const [collegeTotal, setCollegeTotal] = useState(0);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  const pageSize = 24;

  const compareQueueAbsorbed = useRef(false);

  useEffect(() => {
    setShortlist(readShortlistFromStorage());
  }, []);

  useEffect(() => {
    if (compareQueueAbsorbed.current) return;
    const q = readCompareQueue();
    if (!q.length) return;
    compareQueueAbsorbed.current = true;
    setCompare((prev) => {
      const map = new Map<string, string>();
      prev.forEach((x) => map.set(x.id, x.name));
      q.forEach((x) => {
        if (map.size < 3) map.set(x.id, x.name || "College");
      });
      return [...map.entries()].map(([id, name]) => ({ id, name }));
    });
    clearCompareQueue();
  }, []);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(AI_CFG_STORAGE_KEY) : null;
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<AiCfg>;
      if (!p || typeof p !== "object") return;
      setAiCfg((prev) => ({
        model: typeof p.model === "string" ? p.model : prev.model,
        tone: typeof p.tone === "string" ? p.tone : prev.tone,
        seo: typeof p.seo === "string" ? p.seo : prev.seo,
        auto: typeof p.auto === "boolean" ? p.auto : prev.auto,
        lang: typeof p.lang === "string" ? p.lang : prev.lang,
        refresh: typeof p.refresh === "string" ? p.refresh : prev.refresh,
      }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/status");
        const data = (await res.json()) as { openai?: boolean; anthropic?: boolean };
        if (!cancelled && typeof data.openai === "boolean") {
          setAiProviders({ openai: data.openai, anthropic: Boolean(data.anthropic) });
        }
      } catch {
        if (!cancelled) setAiProviders(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/shortlist", { credentials: "include" });
        const data = (await res.json()) as { items?: { collegeId: string; collegeName: string }[] };
        if (cancelled || !data.items?.length) return;
        const fromServer = data.items.map((x) => ({ id: x.collegeId, name: x.collegeName || "Saved college" }));
        const merged = new Map<string, string>();
        readShortlistFromStorage().forEach((x) => merged.set(x.id, x.name));
        fromServer.forEach((x) => merged.set(x.id, x.name));
        const arr = [...merged.entries()].map(([id, name]) => ({ id, name }));
        writeShortlistToStorage(arr);
        setShortlist(arr);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  useEffect(() => {
    if (activeTab !== "colleges") {
      setCollegesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setCollegesLoading(true);
      try {
        const u = new URL("/api/colleges", window.location.origin);
        u.searchParams.set("page", String(collegePage));
        u.searchParams.set("pageSize", String(pageSize));
        if (filterState) u.searchParams.set("state", filterState);
        if (filterDistrict) u.searchParams.set("district", filterDistrict);
        if (collegeSearch.trim()) u.searchParams.set("q", collegeSearch.trim());
        if (filterCourse.trim()) u.searchParams.set("course", filterCourse.trim());
        if (filterExam.trim()) u.searchParams.set("exam", filterExam.trim());
        const res = await fetch(u.toString());
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as { items?: CollegeApi[]; total?: number };
        if (!cancelled) {
          setCollegeItems(Array.isArray(data.items) ? data.items : []);
          setCollegeTotal(typeof data.total === "number" ? data.total : 0);
        }
      } catch {
        if (!cancelled) {
          setCollegeItems([]);
          setCollegeTotal(0);
        }
      } finally {
        if (!cancelled) setCollegesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, collegePage, filterState, filterDistrict, collegeSearch, filterCourse, filterExam]);

  const toggleShortlist = async (id: string, name: string) => {
    const was = shortlist.some((x) => x.id === id);
    const next = toggleShortlistInStorage(id, name);
    setShortlist(next);
    if (session?.user) {
      try {
        if (was) {
          await fetch(`/api/shortlist?collegeId=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
        } else {
          await fetch("/api/shortlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ collegeId: id, collegeName: name }),
          });
        }
      } catch {
        /* offline — local still updated */
      }
    }
  };

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navReserve = 76;
    const y = el.getBoundingClientRect().top + window.scrollY - navReserve;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, []);

  const fallbackReply = (userText: string) => {
    const q = userText.toLowerCase().replace(/\s+/g, " ").trim();
    if (/^(hi|hello|hey|hii|yo)\b|^gm\b|^good (morning|evening|afternoon)\b/.test(q)) {
      return "Hi! Ask me about colleges, courses, or entrance exams in India — for example your target stream (B.Tech, MBBS, MBA), exam (JEE / NEET / CAT), rough score or rank, and states or cities you prefer.";
    }
    if (q.includes("thank")) {
      return "You're welcome! If you share your exam and rough scores next, I can suggest how to build a realistic shortlist.";
    }
    if (q.includes("bye") || q.includes("goodnight") || q.includes("good night")) {
      return "All the best with admissions — come back anytime you want to compare options or plan next steps.";
    }
    if (
      q.includes("best coll") ||
      q.includes("best college") ||
      q.includes("top college") ||
      q.includes("which college") ||
      (q.includes("college") && (q.includes("best") || q.includes("top") || q.includes("good")))
    ) {
      return "“Best” depends on your stream, budget, and exam performance. For B.Tech, students often compare NITs, IIITs, and strong state universities; for medicine, central and state medical colleges matter most. Tell me your course goal, exam (e.g. JEE Main / NEET / CUET), approximate rank or percentile, and region — I’ll outline how to shortlist sensibly.";
    }
    if (q.includes("fee") || q.includes("fees") || q.includes("tuition")) {
      return "Fees vary a lot by college type (govt vs private), branch, and hostel. Use the college cards on this site for indicative numbers, then confirm on the institution’s official notice for the current academic year.";
    }
    if (q.includes("placement") || q.includes("package") || q.includes("ctc")) {
      return "Placement stats are usually published in annual reports or brochures — treat averages as indicative. Share your branch or MBA focus and I can suggest what to look for in placement disclosures.";
    }
    if (q.includes("ranking") || q.includes("nirf")) {
      return "NIRF and other rankings are useful signals but not the whole story — also check accreditation, faculty, labs, and alumni in your target field. Which stream are you aiming for?";
    }
    if (q.includes("jee")) {
      return "Based on JEE scores, I'd suggest IIT Bombay (NIRF #1), IIT Delhi (#2), or IIT Madras (#3). Want a detailed fee + placement comparison?";
    }
    if (q.includes("mba") || q.includes("cat")) {
      return "For MBA, consider IIM Ahmedabad, IIM Bangalore, and ISB Hyderabad. What's your CAT percentile? I can suggest how to shortlist next.";
    }
    if (q.includes("neet")) {
      return "For NEET, top picks are AIIMS Delhi, JIPMER Puducherry, and CMC Vellore. Share your expected score for a more tailored list.";
    }
    if (q.includes("cuet")) {
      return "For CUET UG, start from your target university and programme — cutoffs differ by central vs state universities and by domain. Share course + rough percentile if you want a sharper shortlist strategy.";
    }
    return "Tell me your target course (e.g. B.Tech, MBBS, B.Com), which entrance you’re writing (JEE / NEET / CUET / CAT), and your state or city preference — I’ll respond with clearer next steps. (Live AI: add OPENAI_API_KEY on the server for richer answers.)";
  };

  const sendChat = async () => {
    const userText = chatIn.trim();
    if (!userText || chatSending) return;
    setChatIn("");
    const nextMsgs: ChatMsg[] = [...chatMsgs, { role: "user", text: userText }];
    setChatMsgs(nextMsgs);
    setChatSending(true);
    const transcript = nextMsgs.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: aiCfg, messages: transcript }),
      });
      let data: { text?: string; error?: string } = {};
      try {
        data = (await res.json()) as { text?: string; error?: string };
      } catch {
        data = {};
      }
      if (!res.ok || !data.text?.trim()) {
        throw new Error(data.error ?? "AI unavailable");
      }
      setChatMsgs([...nextMsgs, { role: "ai", text: data.text.trim() }]);
    } catch {
      setChatMsgs([...nextMsgs, { role: "ai", text: fallbackReply(userText) }]);
    } finally {
      setChatSending(false);
    }
  };

  const toggleCmp = (id: string, name: string) =>
    setCompare((p) => {
      const next = p.some((x) => x.id === id) ? p.filter((x) => x.id !== id) : p.length < 3 ? [...p, { id, name }] : p;
      writeCompareQueue(next.map((x) => ({ id: x.id, name: x.name })));
      return next;
    });

  const navAction = (label: string) => {
    if (label === "Colleges") {
      setActiveTab("colleges");
      scrollToId("section-explore");
    } else if (label === "Courses") {
      setActiveTab("courses");
      scrollToId("section-explore");
    } else if (label === "Exams") {
      setActiveTab("exams");
      scrollToId("section-explore");
    } else if (label === "Rankings") {
      scrollToId("section-rankings");
    }
  };

  const navButton = (label: string) => (
    <button
      key={label}
      type="button"
      onClick={() => navAction(label)}
      style={{
        color: C.slateLight,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        transition: "color .2s",
        background: "transparent",
        border: "none",
        fontFamily: "inherit",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = C.white;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = C.slateLight;
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: C.offWhite, minHeight: "100vh", color: C.navyMid }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${C.slateLight};border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideR{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        .fade-up{animation:fadeUp .5s ease-out both}
        .s1{animation-delay:.08s}.s2{animation-delay:.16s}.s3{animation-delay:.24s}.s4{animation-delay:.32s}.s5{animation-delay:.4s}
        .card-h{transition:all .25s cubic-bezier(.4,0,.2,1)}
        .card-h:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(11,17,32,.08)}
        .serif{font-family:'Playfair Display',Georgia,serif}
        .btn-amber{background:${C.amber};color:${C.navy};border:none;padding:12px 28px;border-radius:10px;font-weight:600;cursor:pointer;transition:all .2s;font-size:15px;font-family:inherit}
        .btn-amber:hover{background:${C.amberDark};transform:translateY(-1px);box-shadow:0 6px 20px rgba(245,158,11,.3)}
        .btn-outline{background:transparent;color:${C.white};border:1.5px solid rgba(255,255,255,.25);padding:11px 26px;border-radius:10px;font-weight:600;cursor:pointer;transition:all .2s;font-size:15px;font-family:inherit}
        .btn-outline:hover{border-color:${C.amber};color:${C.amber};background:rgba(245,158,11,.06)}
        .btn-navy{background:${C.navyMid};color:${C.white};border:none;padding:12px 28px;border-radius:10px;font-weight:600;cursor:pointer;transition:all .2s;font-size:15px;font-family:inherit}
        .btn-navy:hover{background:${C.navy};box-shadow:0 6px 20px rgba(15,23,42,.2)}
        .tag{display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.3px}
        .chip{padding:8px 20px;border-radius:24px;font-size:14px;font-weight:500;cursor:pointer;border:none;transition:all .2s;font-family:inherit}
        .chip-on{background:${C.navyMid};color:${C.white}}
        .chip-off{background:${C.white};color:${C.slate};border:1.5px solid ${C.border}}
        .chip-off:hover{border-color:${C.navyMid};color:${C.navyMid}}
        .input-s{width:100%;padding:16px 20px 16px 50px;border:2px solid ${C.border};border-radius:14px;font-size:16px;outline:none;transition:all .3s;background:${C.white};font-family:inherit;color:${C.navyMid}}
        .input-s:focus{border-color:${C.amber};box-shadow:0 0 0 4px rgba(245,158,11,.1)}
        .input-s::placeholder{color:${C.slateLight}}
        #section-hero,
        #section-explore,
        #section-seo,
        #section-rankings,
        #ai-counsellor {
          scroll-margin-top: 76px;
        }
      `}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: C.navy, padding: "0 24px", borderBottom: `1px solid ${C.borderDark}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: `linear-gradient(135deg, ${C.amber}, ${C.amberDark})`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.navy,
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              E
            </div>
            <span className="serif" style={{ fontSize: 21, fontWeight: 700, color: C.white, letterSpacing: "-.3px" }}>
              EduSphere
            </span>
          </Link>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {["Colleges", "Courses", "Exams", "Rankings"].map((i) => navButton(i))}
            {session?.user ? (
              <>
                <Link href="/colleges/saved" style={{ color: C.slateLight, fontSize: 14, fontWeight: 600 }}>
                  Saved{shortlist.length ? ` (${shortlist.length})` : ""}
                </Link>
                <Link href="/portal" style={{ color: C.amber, fontSize: 14, fontWeight: 600 }}>
                  Portal
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{
                    background: "transparent",
                    color: C.slateLight,
                    border: `1px solid rgba(255,255,255,.2)`,
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/colleges/saved" style={{ color: C.slateLight, fontSize: 14, fontWeight: 600 }}>
                  Saved{shortlist.length ? ` (${shortlist.length})` : ""}
                </Link>
                <Link href="/login" style={{ color: C.amber, fontSize: 14, fontWeight: 600 }}>
                  Log in
                </Link>
              </>
            )}
            <button className="btn-amber" style={{ padding: "7px 18px", fontSize: 13, borderRadius: 8 }} onClick={() => setShowAI(!showAI)}>
              ⚙ AI Engine
            </button>
          </div>
        </div>
      </nav>

      <section
        id="section-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: C.navy,
          backgroundImage: [
            `linear-gradient(165deg, rgba(11,17,32,0.88) 0%, rgba(15,23,42,0.72) 42%, rgba(11,17,32,0.9) 100%)`,
            `linear-gradient(to bottom, rgba(11,17,32,0.55) 0%, transparent 42%)`,
            "url(/hero-campus.svg)",
          ].join(", "),
          backgroundSize: "cover, cover, cover",
          backgroundPosition: "center, center, center bottom",
          backgroundRepeat: "no-repeat",
          padding: "72px 24px 56px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            right: "8%",
            width: 280,
            height: 280,
            background: `radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "5%",
            width: 200,
            height: 200,
            background: `radial-gradient(circle, rgba(16,185,129,.05) 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "15%",
            width: 2,
            height: 60,
            background: `linear-gradient(to bottom, ${C.amber}33, transparent)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: "12%",
            width: 2,
            height: 40,
            background: `linear-gradient(to bottom, ${C.teal}33, transparent)`,
          }}
        />

        <div className="fade-up" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div
            className="tag s1"
            style={{
              background: "rgba(16,185,129,.12)",
              color: C.teal,
              marginBottom: 20,
              border: `1px solid rgba(16,185,129,.2)`,
            }}
          >
            ✓ Trusted by 10M+ Students Across India
          </div>
          <h1 className="serif s2" style={{ fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.12, marginBottom: 18, color: C.white }}>
            Your College Journey
            <br />
            <span style={{ color: C.amber }}>Begins Here</span>
          </h1>
          <p className="s3" style={{ fontSize: 17, color: C.slateLight, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.65 }}>
            30,000+ colleges. 500+ exams. AI-powered counselling. Every data point verified — so you can focus on getting in.
          </p>
          <div className="s4" style={{ position: "relative", maxWidth: 600, margin: "0 auto 20px" }}>
            <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: C.slateLight }}>🔍</span>
            <input
              className="input-s"
              placeholder="Search colleges, courses, exams, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "rgba(255,255,255,.06)", border: `1.5px solid rgba(255,255,255,.12)`, color: C.white }}
            />
            <button
              type="button"
              className="btn-amber"
              onClick={() => {
                setFilterCourse("");
                setFilterExam("");
                setCollegeSearch(searchQuery);
                setActiveTab("colleges");
                setCollegePage(1);
                scrollToId("section-explore");
              }}
              style={{
                position: "absolute",
                right: 5,
                top: "50%",
                transform: "translateY(-50%)",
                padding: "10px 24px",
                borderRadius: 10,
              }}
            >
              Search
            </button>
          </div>
          <div className="s5" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["MBA in Bangalore", "Top IITs", "NEET Colleges", "B.Tech CS"].map((q) => (
              <button
                key={q}
                type="button"
                className="chip"
                onClick={() => {
                  setFilterCourse("");
                  setFilterExam("");
                  setSearchQuery(q);
                  setCollegeSearch(q);
                  setActiveTab("colleges");
                  setCollegePage(1);
                  scrollToId("section-explore");
                }}
                style={{
                  background: "rgba(255,255,255,.06)",
                  color: C.slateLight,
                  border: `1px solid rgba(255,255,255,.1)`,
                  fontSize: 13,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="fade-up" style={{ textAlign: "center", animationDelay: `${i * 0.08}s` }}>
              <div className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.navyMid }}>
                <AnimCounter target={s.num} suffix={s.suffix} />
              </div>
              <div style={{ color: C.slateLight, fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="ai-counsellor" style={{ padding: "48px 24px 40px", background: C.navyMid, borderBottom: `1px solid rgba(255,255,255,.06)` }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              className="tag"
              style={{
                background: "rgba(245,158,11,.1)",
                color: C.amber,
                marginBottom: 14,
                border: `1px solid rgba(245,158,11,.2)`,
              }}
            >
              AI-Powered Counselling
            </div>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.white, marginBottom: 10 }}>
              Talk to Our AI Counselor
            </h2>
            <p style={{ color: C.slateLight, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              Replies are generated on the server via <code style={{ color: C.amber }}>POST /api/ai/chat</code> using your{" "}
              <strong style={{ color: C.white }}>AI Engine</strong> settings (model, tone, language). Set{" "}
              <code style={{ color: C.amber }}>OPENAI_API_KEY</code> in <code style={{ color: C.amber }}>.env</code> for live answers; for Claude-labelled
              models, add <code style={{ color: C.amber }}>ANTHROPIC_API_KEY</code>.
            </p>
            {aiProviders && !aiProviders.openai && !aiProviders.anthropic && (
              <p style={{ color: "#FBBF24", fontSize: 13, marginTop: 12, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                No API keys detected — you will see scripted fallback replies until keys are configured.
              </p>
            )}
          </div>
          <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 16, border: `1px solid rgba(255,255,255,.08)`, overflow: "hidden" }}>
            <div style={{ padding: 20, maxHeight: 280, overflowY: "auto" }}>
              {chatMsgs.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 10,
                    animation: "slideR .3s ease-out",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.55,
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user" ? `linear-gradient(135deg, ${C.amber}, ${C.amberDark})` : "rgba(255,255,255,.07)",
                      color: m.role === "user" ? C.navy : C.white,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", gap: 8 }}>
              <input
                value={chatIn}
                onChange={(e) => setChatIn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendChat();
                  }
                }}
                disabled={chatSending}
                placeholder="Ask about colleges, courses, exams..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,.05)",
                  border: `1px solid rgba(255,255,255,.1)`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  color: C.white,
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                  opacity: chatSending ? 0.7 : 1,
                }}
              />
              <button
                type="button"
                className="btn-amber"
                onClick={() => void sendChat()}
                disabled={chatSending}
                style={{ padding: "12px 22px", opacity: chatSending ? 0.85 : 1 }}
              >
                {chatSending ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="section-explore" style={{ padding: "56px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="tag" style={{ background: C.amberLight, color: C.amberDark, marginBottom: 10 }}>
              Explore
            </div>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.navyMid }}>
              India&apos;s Top Colleges
            </h2>
          </div>
          <div style={{ color: C.slateLight, fontSize: 14 }}>Ranked by NIRF 2026</div>
        </div>
        <p style={{ color: C.slateLight, fontSize: 15, marginBottom: 28, maxWidth: 550 }}>
          Discover, compare, and apply — backed by verified data, student reviews, and AI-powered insights.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { id: "colleges", label: "Top Colleges" },
            { id: "courses", label: "By Course" },
            { id: "exams", label: "By Exam" },
            { id: "cities", label: "By City" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`chip ${activeTab === tab.id ? "chip-on" : "chip-off"}`}
              onClick={() => {
                setActiveTab(tab.id);
                setCollegePage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "colleges" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setFilterDistrict("");
                  setCollegePage(1);
                }}
                style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, minWidth: 200 }}
              >
                <option value="">All states &amp; UTs</option>
                {INDIA_STATES_AND_UTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={filterDistrict}
                onChange={(e) => {
                  setFilterDistrict(e.target.value);
                  setCollegePage(1);
                }}
                disabled={!filterState}
                style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, minWidth: 200 }}
              >
                <option value="">All districts</option>
                {(filterState ? listDistrictsForState(filterState as IndiaState) : []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                value={collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  setCollegePage(1);
                }}
                placeholder="Search this list…"
                style={{
                  flex: "1 1 220px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 14,
                  minWidth: 200,
                }}
              />
              <span style={{ fontSize: 13, color: C.slateLight, whiteSpace: "nowrap" }}>
                {collegesLoading ? "Loading…" : `${collegeTotal.toLocaleString()} colleges`}
              </span>
            </div>
            {(filterCourse || filterExam) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.slateLight, fontWeight: 600 }}>Active filters:</span>
                {filterCourse && (
                  <button
                    type="button"
                    className="chip chip-on"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => {
                      setFilterCourse("");
                      setCollegePage(1);
                    }}
                  >
                    Course: {filterCourse} ✕
                  </button>
                )}
                {filterExam && (
                  <button
                    type="button"
                    className="chip chip-on"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => {
                      setFilterExam("");
                      setCollegePage(1);
                    }}
                  >
                    Exam: {filterExam} ✕
                  </button>
                )}
              </div>
            )}
            {collegesLoading ? (
              <PageLoader inline message="Loading colleges…" />
            ) : (
            <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
              {collegeItems.map((c, i) => (
                <div
                  key={c.id}
                  className="card-h fade-up"
                  style={{
                    background: C.white,
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    overflow: "hidden",
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div
                    style={{
                      height: 3,
                      background: i % 5 === 0 ? `linear-gradient(90deg, ${C.amber}, ${C.amberDark})` : `linear-gradient(90deg, ${C.teal}, ${C.tealDark})`,
                    }}
                  />
                  <div style={{ padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navyMid, lineHeight: 1.25 }}>{c.name}</h3>
                          <span className="tag" style={{ background: C.tealLight, color: C.tealDark, padding: "2px 8px", fontSize: 11 }}>
                            ✓ Verified
                          </span>
                        </div>
                        <p style={{ color: C.slateLight, fontSize: 12 }}>
                          {c.district}, {c.state} · {c.type} · {c.accept}
                        </p>
                        <p style={{ color: C.slate, fontSize: 11, marginTop: 6, lineHeight: 1.45 }}>{c.courses}</p>
                      </div>
                      <div
                        style={{
                          background: C.navyMid,
                          color: C.amber,
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          minWidth: 36,
                          textAlign: "center",
                        }}
                      >
                        #{c.rank}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
                      {[
                        { l: "Fees", v: c.fees },
                        { l: "NAAC", v: c.naac },
                        { l: "Avg CTC", v: c.placements },
                        { l: "Rating", v: `⭐ ${c.rating}` },
                      ].map((d) => (
                        <div key={d.l} style={{ background: C.offWhite, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 10,
                              color: C.slateLight,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: ".5px",
                              marginBottom: 2,
                            }}
                          >
                            {d.l}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navyMid }}>{d.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link
                        href={`/colleges/detail?id=${encodeURIComponent(c.id)}`}
                        className="btn-navy"
                        style={{ flex: "1 1 120px", padding: "9px 14px", fontSize: 13, borderRadius: 8, textAlign: "center", display: "inline-block" }}
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        className="chip"
                        style={{
                          padding: "9px 12px",
                          fontSize: 13,
                          borderRadius: 8,
                          background: shortlist.some((x) => x.id === c.id) ? C.tealLight : "transparent",
                          color: shortlist.some((x) => x.id === c.id) ? C.tealDark : C.slate,
                          border: `1.5px solid ${shortlist.some((x) => x.id === c.id) ? C.teal : C.border}`,
                          fontWeight: 600,
                        }}
                        onClick={() => toggleShortlist(c.id, c.name)}
                      >
                        {shortlist.some((x) => x.id === c.id) ? "★ Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="chip"
                        style={{
                          padding: "9px 12px",
                          fontSize: 13,
                          borderRadius: 8,
                          background: compare.some((x) => x.id === c.id) ? C.amberLight : "transparent",
                          color: compare.some((x) => x.id === c.id) ? C.amberDark : C.slate,
                          border: `1.5px solid ${compare.some((x) => x.id === c.id) ? C.amber : C.border}`,
                          fontWeight: 600,
                        }}
                        onClick={() => toggleCmp(c.id, c.name)}
                      >
                        {compare.some((x) => x.id === c.id) ? "✓ Compare" : "+ Compare"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {collegeTotal > pageSize && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, alignItems: "center" }}>
                <button
                  type="button"
                  className="chip chip-off"
                  disabled={collegePage <= 1}
                  onClick={() => setCollegePage((p) => Math.max(1, p - 1))}
                  style={{ padding: "10px 18px" }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 14, color: C.slateLight }}>
                  Page {collegePage} of {Math.max(1, Math.ceil(collegeTotal / pageSize))}
                </span>
                <button
                  type="button"
                  className="chip chip-off"
                  disabled={collegePage >= Math.ceil(collegeTotal / pageSize)}
                  onClick={() => setCollegePage((p) => p + 1)}
                  style={{ padding: "10px 18px" }}
                >
                  Next
                </button>
              </div>
            )}
            </>
            )}
          </div>
        )}

        {activeTab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {COURSES_LIST.map((c, i) => (
              <div
                key={c}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFilterExam("");
                    setCollegeSearch("");
                    setFilterCourse(c);
                    setActiveTab("colleges");
                    setCollegePage(1);
                    scrollToId("section-explore");
                  }
                }}
                className="card-h fade-up"
                onClick={() => {
                  setFilterExam("");
                  setCollegeSearch("");
                  setFilterCourse(c);
                  setActiveTab("colleges");
                  setCollegePage(1);
                  scrollToId("section-explore");
                }}
                style={{
                  background: C.white,
                  borderRadius: 12,
                  padding: 20,
                  border: `1px solid ${C.border}`,
                  textAlign: "center",
                  cursor: "pointer",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: C.amberLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    fontSize: 20,
                  }}
                >
                  📖
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.navyMid }}>{c}</div>
                <div style={{ color: C.slateLight, fontSize: 13, marginTop: 4 }}>{courseCount(i)} colleges</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "exams" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {EXAMS.map((e, i) => (
              <div
                key={e}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setFilterCourse("");
                    setCollegeSearch("");
                    setFilterExam(e);
                    setActiveTab("colleges");
                    setCollegePage(1);
                    scrollToId("section-explore");
                  }
                }}
                className="card-h fade-up"
                onClick={() => {
                  setFilterCourse("");
                  setCollegeSearch("");
                  setFilterExam(e);
                  setActiveTab("colleges");
                  setCollegePage(1);
                  scrollToId("section-explore");
                }}
                style={{
                  background: C.white,
                  borderRadius: 12,
                  padding: 18,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: C.tealLight,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  📝
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: C.navyMid }}>{e}</div>
                  <div style={{ color: C.teal, fontSize: 12, fontWeight: 500 }}>Registration Open →</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "cities" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {CITIES.map((c, i) => (
              <div
                key={c}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setFilterCourse("");
                    setFilterExam("");
                    setCollegeSearch(c);
                    setActiveTab("colleges");
                    setCollegePage(1);
                    scrollToId("section-explore");
                  }
                }}
                className="card-h fade-up"
                onClick={() => {
                  setFilterCourse("");
                  setFilterExam("");
                  setCollegeSearch(c);
                  setActiveTab("colleges");
                  setCollegePage(1);
                  scrollToId("section-explore");
                }}
                style={{
                  background: C.white,
                  borderRadius: 12,
                  padding: 22,
                  border: `1px solid ${C.border}`,
                  textAlign: "center",
                  cursor: "pointer",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 8 }}>🌆</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: C.navyMid }}>{c}</div>
                <div style={{ color: C.slateLight, fontSize: 13, marginTop: 4 }}>{cityCount(i)} colleges</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 48, maxWidth: 560 }}>
          <GuidanceLeadForm variant="card" />
        </div>
      </section>

      {compare.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: C.navy,
            padding: "12px 24px",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            animation: "fadeUp .3s ease-out",
          }}
        >
          <span style={{ fontWeight: 600, color: C.amber, fontSize: 14 }}>Compare ({compare.length}/3):</span>
          {compare.map((n) => (
            <span
              key={n.id}
              className="tag"
              style={{
                background: "rgba(245,158,11,.12)",
                color: C.amber,
                cursor: "pointer",
                border: `1px solid rgba(245,158,11,.25)`,
              }}
              onClick={() => toggleCmp(n.id, n.name)}
            >
              {n.name} ✕
            </span>
          ))}
          {compare.length >= 2 && (
            <button
              type="button"
              className="btn-amber"
              style={{ padding: "8px 20px", fontSize: 13 }}
              onClick={() => {
                const q = compare.map((x) => encodeURIComponent(x.id)).join(",");
                router.push(`/colleges/compare?ids=${q}`);
              }}
            >
              Compare now →
            </button>
          )}
        </div>
      )}

      <section id="section-seo" style={{ padding: "64px 24px", background: C.cream }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="tag" style={{ background: C.tealLight, color: C.tealDark, marginBottom: 12 }}>
              SEO Engine
            </div>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>
              Built for Search Dominance
            </h2>
            <p style={{ color: C.slateLight, fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
              AI-powered programmatic SEO generates and optimises 2M+ pages automatically
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                icon: "🔄",
                title: "Programmatic Pages",
                desc: "Auto-generate unique pages for every college + course + city combination. 2M+ indexed with unique AI content.",
                metric: "2M+ pages",
              },
              {
                icon: "🧠",
                title: "AI Content Pipeline",
                desc: "6-stage pipeline: Research → Brief → Generate → Review → Publish → Monitor. 5,000+ pages per day.",
                metric: "5K/day",
              },
              {
                icon: "📊",
                title: "Rich Schema Markup",
                desc: "JSON-LD on every page: FAQPage, Review, Course, Event, BreadcrumbList — 15+ schema types.",
                metric: "15+ types",
              },
              {
                icon: "🔗",
                title: "Internal Linking AI",
                desc: "Contextual interlinking with hub-and-spoke model. Automated 'Related' and 'Also Viewed' blocks.",
                metric: "10M+ links",
              },
              {
                icon: "⚡",
                title: "Core Web Vitals",
                desc: "LCP < 1.5s, FID < 50ms, CLS < 0.05. ISR + edge caching + critical CSS inlining.",
                metric: "100/100",
              },
              {
                icon: "📈",
                title: "Real-Time Tracking",
                desc: "Rankings, CTR, traffic monitoring. Underperforming pages auto-queued for AI content refresh.",
                metric: "24/7",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="card-h fade-up"
                style={{
                  background: C.white,
                  borderRadius: 14,
                  padding: 24,
                  border: `1px solid ${C.border}`,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: C.offWhite,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="tag" style={{ background: C.amberLight, color: C.amberDark }}>
                    {item.metric}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: C.navyMid }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: C.slateLight, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="section-rankings" style={{ padding: "56px 24px", background: C.white }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h3 className="serif" style={{ fontSize: 24, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>
              Programmatic URL Architecture
            </h3>
            <p style={{ color: C.slateLight, fontSize: 14 }}>Every combination generates a unique, SEO-optimised page</p>
          </div>
          <div style={{ background: C.offWhite, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {[
              { p: "/colleges/{slug}", e: "/colleges/iit-bombay", n: "30K+" },
              { p: "/courses/{course}-in-{city}", e: "/courses/mba-in-bangalore", n: "50K+" },
              { p: "/compare/{c1}-vs-{c2}", e: "/compare/iit-bombay-vs-iit-delhi", n: "1M+" },
              { p: "/{course}-colleges-in-{state}", e: "/engineering-colleges-in-maharashtra", n: "5K+" },
              { p: "/exams/{slug}", e: "/exams/jee-main", n: "500+" },
              { p: "/rankings/{category}", e: "/rankings/top-engineering-colleges", n: "2K+" },
            ].map((u, i) => (
              <div
                key={u.p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "13px 20px",
                  borderBottom: i < 5 ? `1px solid ${C.border}` : "none",
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <code
                  style={{
                    flex: 1,
                    color: C.navyMid,
                    background: C.white,
                    padding: "5px 12px",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontWeight: 500,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {u.p}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    const slug = u.e.replace(/^\/+/, "").split("/").pop() ?? "";
                    const human = slug.replace(/-/g, " ");
                    setCollegeSearch(human);
                    setActiveTab("colleges");
                    setCollegePage(1);
                    scrollToId("section-explore");
                  }}
                  style={{
                    flex: 1.2,
                    color: C.tealDark,
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                >
                  {u.e} →
                </button>
                <span className="tag" style={{ background: C.tealLight, color: C.tealDark, minWidth: 56, textAlign: "center" }}>
                  {u.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAI && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11,17,32,.6)",
            backdropFilter: "blur(4px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowAI(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 18,
              maxWidth: 560,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 28,
              animation: "fadeUp .3s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, color: C.navyMid }}>
                  AI Engine Configuration
                </h2>
                <p style={{ color: C.slateLight, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  These options are sent with each counsellor message to <code style={{ color: C.navyMid }}>POST /api/ai/chat</code> (server-side). Save
                  stores them in this browser; add API keys in <code style={{ color: C.navyMid }}>.env</code> on the server.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAI(false)}
                style={{
                  background: C.offWhite,
                  border: "none",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 16,
                  color: C.slate,
                }}
              >
                ✕
              </button>
            </div>

            {(
              [
                { label: "AI Model", key: "model" as const, options: SEO_CONFIG.models },
                { label: "Content Tone", key: "tone" as const, options: SEO_CONFIG.tones },
                { label: "SEO Aggressiveness", key: "seo" as const, options: SEO_CONFIG.seoLevels },
                { label: "Language", key: "lang" as const, options: SEO_CONFIG.languages },
              ] satisfies ReadonlyArray<{ label: string; key: AiFieldKey; options: readonly string[] }>
            ).map((f) => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navyMid, marginBottom: 8 }}>{f.label}</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {f.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      className={`chip ${aiCfg[f.key] === o ? "chip-on" : "chip-off"}`}
                      onClick={() => setAiCfg((p) => ({ ...p, [f.key]: o }))}
                      style={{ fontSize: 12, padding: "6px 14px" }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <button
                  type="button"
                  aria-pressed={aiCfg.auto}
                  onClick={() => setAiCfg((p) => ({ ...p, auto: !p.auto }))}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: aiCfg.auto ? C.teal : C.border,
                    position: "relative",
                    cursor: "pointer",
                    transition: "background .2s",
                    flexShrink: 0,
                    border: "none",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: C.white,
                      position: "absolute",
                      top: 2,
                      left: aiCfg.auto ? 22 : 2,
                      transition: "left .2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,.15)",
                    }}
                  />
                </button>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navyMid }}>Auto-Publish AI Content</div>
                  <div style={{ fontSize: 11, color: C.slateLight }}>Skip manual review for AI-generated pages</div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyMid, display: "block", marginBottom: 8 }}>Refresh Frequency</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["Daily", "Weekly", "Monthly", "On-demand"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`chip ${aiCfg.refresh === f ? "chip-on" : "chip-off"}`}
                    onClick={() => setAiCfg((p) => ({ ...p, refresh: f }))}
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: C.offWhite, borderRadius: 10, padding: 14, marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navyMid, marginBottom: 6 }}>Active Configuration</div>
              <div style={{ fontSize: 12, color: C.slateLight, lineHeight: 1.7 }}>
                Model: <strong style={{ color: C.navyMid }}>{aiCfg.model}</strong> · Tone: <strong style={{ color: C.navyMid }}>{aiCfg.tone}</strong> · SEO:{" "}
                <strong style={{ color: C.navyMid }}>{aiCfg.seo}</strong>
                <br />
                Language: <strong style={{ color: C.navyMid }}>{aiCfg.lang}</strong> · Auto-Publish:{" "}
                <strong style={{ color: aiCfg.auto ? C.teal : C.amberDark }}>{aiCfg.auto ? "Enabled" : "Review Required"}</strong> · Refresh:{" "}
                <strong style={{ color: C.navyMid }}>{aiCfg.refresh}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-amber"
              style={{ width: "100%" }}
              onClick={() => {
                try {
                  window.localStorage.setItem(AI_CFG_STORAGE_KEY, JSON.stringify(aiCfg));
                } catch {
                  /* quota */
                }
                setShowAI(false);
              }}
            >
              Save configuration
            </button>
          </div>
        </div>
      )}

      <section style={{ padding: "72px 24px", background: C.navy, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            background: `radial-gradient(circle, rgba(245,158,11,.06) 0%, transparent 60%)`,
            borderRadius: "50%",
          }}
        />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <h2 className="serif" style={{ fontSize: 34, fontWeight: 700, color: C.white, marginBottom: 14, lineHeight: 1.15 }}>
            Ready to Find Your <span style={{ color: C.amber }}>Perfect College</span>?
          </h2>
          <p style={{ color: C.slateLight, fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>
            Join 10M+ students who found their path through EduSphere. Free counselling, no obligations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-amber" style={{ padding: "14px 32px", fontSize: 16, display: "inline-block" }}>
              Sign in to continue →
            </Link>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: "14px 32px", fontSize: 16 }}
              onClick={() => scrollToId("ai-counsellor")}
            >
              Book Free Counselling
            </button>
          </div>
        </div>
      </section>

      <footer style={{ background: C.navy, color: C.slateLight, padding: "48px 24px 20px", borderTop: `1px solid ${C.borderDark}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: `linear-gradient(135deg, ${C.amber}, ${C.amberDark})`,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.navy,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  E
                </div>
                <span className="serif" style={{ fontSize: 18, fontWeight: 700, color: C.white }}>
                  EduSphere
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>
                India&apos;s AI-powered college discovery platform. Find, compare, and apply to 30,000+ colleges.
              </p>
            </div>
            {[
              { t: "Explore", links: ["Colleges", "Courses", "Exams", "Rankings", "Compare"] },
              { t: "Resources", links: ["Blog", "News", "Predictors", "Counselling", "Application"] },
              { t: "Company", links: ["About Us", "Careers", "Contact", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.t}>
                <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{col.t}</div>
                {col.links.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      if (l === "Colleges" || l === "Compare") {
                        setActiveTab("colleges");
                        scrollToId("section-explore");
                      } else if (l === "Courses") {
                        setActiveTab("courses");
                        scrollToId("section-explore");
                      } else if (l === "Exams") {
                        setActiveTab("exams");
                        scrollToId("section-explore");
                      } else if (l === "Rankings") {
                        scrollToId("section-rankings");
                      } else if (l === "Counselling" || l === "Application") {
                        scrollToId("ai-counsellor");
                      } else if (l === "Contact") {
                        window.location.href = "mailto:support@edusphere.example";
                      } else if (l === "Privacy" || l === "Terms") {
                        router.push("/login");
                      } else {
                        scrollToId("section-explore");
                      }
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      fontSize: 13,
                      marginBottom: 8,
                      cursor: "pointer",
                      transition: "color .2s",
                      background: "none",
                      border: "none",
                      color: C.slateLight,
                      fontFamily: "inherit",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = C.amber;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = C.slateLight;
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: `1px solid ${C.borderDark}`,
              paddingTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 12,
            }}
          >
            <span>© 2026 EduSphere. All rights reserved.</span>
            <span style={{ color: C.amber, fontWeight: 500 }}>Powered by AI SEO Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
