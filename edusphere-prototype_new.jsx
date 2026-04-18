import { useState, useEffect, useRef } from "react";

const COLLEGES = [
  { name: "IIT Bombay", city: "Mumbai", type: "IIT", rating: 4.8, rank: 1, fees: "₹2.2L/yr", courses: 45, naac: "A++", placements: "₹30L avg", accept: "JEE Advanced" },
  { name: "IIT Delhi", city: "Delhi", type: "IIT", rating: 4.7, rank: 2, fees: "₹2.1L/yr", courses: 40, naac: "A++", placements: "₹28L avg", accept: "JEE Advanced" },
  { name: "IIT Madras", city: "Chennai", type: "IIT", rating: 4.9, rank: 3, fees: "₹2.0L/yr", courses: 38, naac: "A++", placements: "₹32L avg", accept: "JEE Advanced" },
  { name: "BITS Pilani", city: "Pilani", type: "Private", rating: 4.6, rank: 4, fees: "₹5.5L/yr", courses: 30, naac: "A+", placements: "₹22L avg", accept: "BITSAT" },
  { name: "NIT Trichy", city: "Trichy", type: "NIT", rating: 4.5, rank: 5, fees: "₹1.8L/yr", courses: 28, naac: "A+", placements: "₹18L avg", accept: "JEE Main" },
  { name: "VIT Vellore", city: "Vellore", type: "Private", rating: 4.3, rank: 6, fees: "₹3.2L/yr", courses: 50, naac: "A++", placements: "₹12L avg", accept: "VITEEE" },
];

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

function AnimCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    if (!vis) return;
    const n = parseInt(target);
    const step = Math.ceil(n / 50);
    let c = 0;
    const t = setInterval(() => { c += step; if (c >= n) { c = n; clearInterval(t); } setCount(c); }, 25);
    return () => clearInterval(t);
  }, [vis, target]);
  const fmt = count >= 1000000 ? (count / 1000000).toFixed(0) + "M" : count >= 1000 ? (count / 1000).toFixed(0) + "K" : count.toString();
  return <span ref={ref}>{fmt}{suffix}</span>;
}

// Zupfly-inspired color palette
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

export default function EduSphere() {
  const [activeTab, setActiveTab] = useState("colleges");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { role: "ai", text: "Hi! I'm EduSphere AI. Share your exam, expected score, preferred city, and budget — I'll recommend the best colleges for you." }
  ]);
  const [chatIn, setChatIn] = useState("");
  const [aiCfg, setAiCfg] = useState({ model: "Claude Sonnet 4", tone: "Student-Friendly", seo: "Medium (Balanced)", auto: false, lang: "English", refresh: "Weekly" });
  const [compare, setCompare] = useState([]);

  const sendChat = () => {
    if (!chatIn.trim()) return;
    setChatMsgs(p => [...p, { role: "user", text: chatIn }]);
    const q = chatIn.toLowerCase();
    const reply = q.includes("jee") ? "Based on JEE scores, I'd suggest IIT Bombay (NIRF #1), IIT Delhi (#2), or IIT Madras (#3). Want a detailed fee + placement comparison?" :
      q.includes("mba") ? "For MBA, consider IIM Ahmedabad, IIM Bangalore, and ISB Hyderabad. What's your CAT percentile? I can predict admission chances." :
      q.includes("neet") ? "For NEET, top picks are AIIMS Delhi, JIPMER Puducherry, and CMC Vellore. Share your expected score for a precise college list." :
      "I can help you find the right college! Share your exam (JEE/NEET/CAT), expected score, preferred city, and annual budget.";
    setTimeout(() => setChatMsgs(p => [...p, { role: "ai", text: reply }]), 500);
    setChatIn("");
  };

  const toggleCmp = (n) => setCompare(p => p.includes(n) ? p.filter(x => x !== n) : p.length < 3 ? [...p, n] : p);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: C.offWhite, minHeight: "100vh", color: C.navyMid }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@500;600;700&display=swap');
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
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: C.navy, padding: "0 24px", borderBottom: `1px solid ${C.borderDark}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: `linear-gradient(135deg, ${C.amber}, ${C.amberDark})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: C.navy, fontWeight: 700, fontSize: 17 }}>E</div>
            <span className="serif" style={{ fontSize: 21, fontWeight: 700, color: C.white, letterSpacing: "-.3px" }}>EduSphere</span>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {["Colleges", "Courses", "Exams", "Rankings"].map(i => (
              <span key={i} style={{ color: C.slateLight, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = C.white}
                onMouseLeave={e => e.target.style.color = C.slateLight}>{i}</span>
            ))}
            <button className="btn-amber" style={{ padding: "7px 18px", fontSize: 13, borderRadius: 8 }} onClick={() => setShowAI(!showAI)}>
              ⚙ AI Engine
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${C.navy} 0%, ${C.navyMid} 55%, ${C.navyLight} 100%)`, padding: "72px 24px 56px" }}>
        <div style={{ position: "absolute", top: 40, right: "8%", width: 280, height: 280, background: `radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -40, left: "5%", width: 200, height: 200, background: `radial-gradient(circle, rgba(16,185,129,.05) 0%, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: 20, left: "15%", width: 2, height: 60, background: `linear-gradient(to bottom, ${C.amber}33, transparent)` }} />
        <div style={{ position: "absolute", bottom: 60, right: "12%", width: 2, height: 40, background: `linear-gradient(to bottom, ${C.teal}33, transparent)` }} />

        <div className="fade-up" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="tag s1" style={{ background: "rgba(16,185,129,.12)", color: C.teal, marginBottom: 20, border: `1px solid rgba(16,185,129,.2)` }}>
            ✓ Trusted by 10M+ Students Across India
          </div>
          <h1 className="serif s2" style={{ fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.12, marginBottom: 18, color: C.white }}>
            Your College Journey<br />
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
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "rgba(255,255,255,.06)", border: `1.5px solid rgba(255,255,255,.12)`, color: C.white }}
            />
            <button className="btn-amber" style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", padding: "10px 24px", borderRadius: 10 }}>Search</button>
          </div>
          <div className="s5" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["MBA in Bangalore", "Top IITs", "NEET Colleges", "B.Tech CS"].map(q => (
              <button key={q} className="chip" onClick={() => setSearchQuery(q)}
                style={{ background: "rgba(255,255,255,.06)", color: C.slateLight, border: `1px solid rgba(255,255,255,.1)`, fontSize: 13 }}>{q}</button>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {STATS.map((s, i) => (
            <div key={i} className="fade-up" style={{ textAlign: "center", animationDelay: `${i * .08}s` }}>
              <div className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.navyMid }}>
                <AnimCounter target={s.num} suffix={s.suffix} />
              </div>
              <div style={{ color: C.slateLight, fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COLLEGES */}
      <section style={{ padding: "56px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="tag" style={{ background: C.amberLight, color: C.amberDark, marginBottom: 10 }}>Explore</div>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.navyMid }}>India's Top Colleges</h2>
          </div>
          <div style={{ color: C.slateLight, fontSize: 14 }}>Ranked by NIRF 2026</div>
        </div>
        <p style={{ color: C.slateLight, fontSize: 15, marginBottom: 28, maxWidth: 550 }}>
          Discover, compare, and apply — backed by verified data, student reviews, and AI-powered insights.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {[{ id: "colleges", label: "Top Colleges" }, { id: "courses", label: "By Course" }, { id: "exams", label: "By Exam" }, { id: "cities", label: "By City" }].map(tab => (
            <button key={tab.id} className={`chip ${activeTab === tab.id ? "chip-on" : "chip-off"}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "colleges" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
            {COLLEGES.map((c, i) => (
              <div key={i} className="card-h fade-up" style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", animationDelay: `${i * .07}s` }}>
                <div style={{ height: 3, background: i < 3 ? `linear-gradient(90deg, ${C.amber}, ${C.amberDark})` : `linear-gradient(90deg, ${C.teal}, ${C.tealDark})` }} />
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navyMid }}>{c.name}</h3>
                        <span className="tag" style={{ background: C.tealLight, color: C.tealDark, padding: "2px 8px", fontSize: 11 }}>✓ Verified</span>
                      </div>
                      <p style={{ color: C.slateLight, fontSize: 13 }}>{c.city} · {c.type} · {c.accept}</p>
                    </div>
                    <div style={{ background: C.navyMid, color: C.amber, padding: "6px 12px", borderRadius: 8, fontWeight: 700, fontSize: 14, minWidth: 36, textAlign: "center" }}>#{c.rank}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
                    {[{ l: "Fees", v: c.fees }, { l: "NAAC", v: c.naac }, { l: "Avg CTC", v: c.placements }, { l: "Rating", v: `⭐ ${c.rating}` }].map((d, j) => (
                      <div key={j} style={{ background: C.offWhite, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: C.slateLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>{d.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navyMid }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-navy" style={{ flex: 1, padding: "9px 14px", fontSize: 13, borderRadius: 8 }}>View Details</button>
                    <button className="chip" style={{ padding: "9px 16px", fontSize: 13, borderRadius: 8, background: compare.includes(c.name) ? C.amberLight : "transparent", color: compare.includes(c.name) ? C.amberDark : C.slate, border: `1.5px solid ${compare.includes(c.name) ? C.amber : C.border}`, fontWeight: 600 }} onClick={() => toggleCmp(c.name)}>
                      {compare.includes(c.name) ? "✓ Added" : "+ Compare"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {COURSES_LIST.map((c, i) => (
              <div key={i} className="card-h fade-up" style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, textAlign: "center", cursor: "pointer", animationDelay: `${i * .04}s` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 20 }}>📖</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.navyMid }}>{c}</div>
                <div style={{ color: C.slateLight, fontSize: 13, marginTop: 4 }}>{Math.floor(Math.random() * 3000 + 500)} colleges</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "exams" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {EXAMS.map((e, i) => (
              <div key={i} className="card-h fade-up" style={{ background: C.white, borderRadius: 12, padding: 18, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", animationDelay: `${i * .04}s` }}>
                <div style={{ width: 42, height: 42, background: C.tealLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📝</div>
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
              <div key={i} className="card-h fade-up" style={{ background: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}`, textAlign: "center", cursor: "pointer", animationDelay: `${i * .04}s` }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>🌆</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: C.navyMid }}>{c}</div>
                <div style={{ color: C.slateLight, fontSize: 13, marginTop: 4 }}>{Math.floor(Math.random() * 500 + 100)} colleges</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COMPARE BAR */}
      {compare.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.navy, padding: "12px 24px", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, animation: "fadeUp .3s ease-out" }}>
          <span style={{ fontWeight: 600, color: C.amber, fontSize: 14 }}>Compare ({compare.length}/3):</span>
          {compare.map(n => (
            <span key={n} className="tag" style={{ background: "rgba(245,158,11,.12)", color: C.amber, cursor: "pointer", border: `1px solid rgba(245,158,11,.25)` }} onClick={() => toggleCmp(n)}>{n} ✕</span>
          ))}
          {compare.length >= 2 && <button className="btn-amber" style={{ padding: "8px 20px", fontSize: 13 }}>Compare Now →</button>}
        </div>
      )}

      {/* AI COUNSELOR */}
      <section style={{ padding: "64px 24px", background: C.navyMid }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="tag" style={{ background: "rgba(245,158,11,.1)", color: C.amber, marginBottom: 14, border: `1px solid rgba(245,158,11,.2)` }}>AI-Powered Counselling</div>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.white, marginBottom: 10 }}>Talk to Our AI Counselor</h2>
            <p style={{ color: C.slateLight, fontSize: 15, maxWidth: 460, margin: "0 auto" }}>Personalised college recommendations based on your profile, scores & preferences — powered by Claude AI.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 16, border: `1px solid rgba(255,255,255,.08)`, overflow: "hidden" }}>
            <div style={{ padding: 20, maxHeight: 280, overflowY: "auto" }}>
              {chatMsgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10, animation: "slideR .3s ease-out" }}>
                  <div style={{
                    maxWidth: "78%", padding: "12px 16px", fontSize: 14, lineHeight: 1.55,
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? `linear-gradient(135deg, ${C.amber}, ${C.amberDark})` : "rgba(255,255,255,.07)",
                    color: m.role === "user" ? C.navy : C.white,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", gap: 8 }}>
              <input value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Ask about colleges, courses, exams..."
                style={{ flex: 1, background: "rgba(255,255,255,.05)", border: `1px solid rgba(255,255,255,.1)`, borderRadius: 10, padding: "12px 16px", color: C.white, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              <button className="btn-amber" onClick={sendChat} style={{ padding: "12px 22px" }}>Send</button>
            </div>
          </div>
        </div>
      </section>

      {/* SEO ENGINE */}
      <section style={{ padding: "64px 24px", background: C.cream }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="tag" style={{ background: C.tealLight, color: C.tealDark, marginBottom: 12 }}>SEO Engine</div>
            <h2 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>Built for Search Dominance</h2>
            <p style={{ color: C.slateLight, fontSize: 15, maxWidth: 520, margin: "0 auto" }}>AI-powered programmatic SEO generates and optimises 2M+ pages automatically</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              { icon: "🔄", title: "Programmatic Pages", desc: "Auto-generate unique pages for every college + course + city combination. 2M+ indexed with unique AI content.", metric: "2M+ pages" },
              { icon: "🧠", title: "AI Content Pipeline", desc: "6-stage pipeline: Research → Brief → Generate → Review → Publish → Monitor. 5,000+ pages per day.", metric: "5K/day" },
              { icon: "📊", title: "Rich Schema Markup", desc: "JSON-LD on every page: FAQPage, Review, Course, Event, BreadcrumbList — 15+ schema types.", metric: "15+ types" },
              { icon: "🔗", title: "Internal Linking AI", desc: "Contextual interlinking with hub-and-spoke model. Automated 'Related' and 'Also Viewed' blocks.", metric: "10M+ links" },
              { icon: "⚡", title: "Core Web Vitals", desc: "LCP < 1.5s, FID < 50ms, CLS < 0.05. ISR + edge caching + critical CSS inlining.", metric: "100/100" },
              { icon: "📈", title: "Real-Time Tracking", desc: "Rankings, CTR, traffic monitoring. Underperforming pages auto-queued for AI content refresh.", metric: "24/7" },
            ].map((item, i) => (
              <div key={i} className="card-h fade-up" style={{ background: C.white, borderRadius: 14, padding: 24, border: `1px solid ${C.border}`, animationDelay: `${i * .06}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, background: C.offWhite, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{item.icon}</div>
                  <span className="tag" style={{ background: C.amberLight, color: C.amberDark }}>{item.metric}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: C.navyMid }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: C.slateLight, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* URL PATTERNS */}
      <section style={{ padding: "56px 24px", background: C.white }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h3 className="serif" style={{ fontSize: 24, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>Programmatic URL Architecture</h3>
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
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: i < 5 ? `1px solid ${C.border}` : "none", gap: 12, fontSize: 13 }}>
                <code style={{ flex: 1, color: C.navyMid, background: C.white, padding: "5px 12px", borderRadius: 6, fontFamily: "monospace", fontWeight: 500, border: `1px solid ${C.border}` }}>{u.p}</code>
                <span style={{ flex: 1.2, color: C.slateLight }}>{u.e}</span>
                <span className="tag" style={{ background: C.tealLight, color: C.tealDark, minWidth: 56, textAlign: "center" }}>{u.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CONFIG MODAL */}
      {showAI && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,17,32,.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowAI(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: 28, animation: "fadeUp .3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, color: C.navyMid }}>AI Engine Configuration</h2>
                <p style={{ color: C.slateLight, fontSize: 13, marginTop: 4 }}>Tune content generation, SEO, and recommendation behaviour</p>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background: C.offWhite, border: "none", width: 34, height: 34, borderRadius: 8, cursor: "pointer", fontSize: 16, color: C.slate }}>✕</button>
            </div>

            {[
              { label: "AI Model", key: "model", options: SEO_CONFIG.models },
              { label: "Content Tone", key: "tone", options: SEO_CONFIG.tones },
              { label: "SEO Aggressiveness", key: "seo", options: SEO_CONFIG.seoLevels },
              { label: "Language", key: "lang", options: SEO_CONFIG.languages },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navyMid, marginBottom: 8 }}>{f.label}</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {f.options.map(o => (
                    <button key={o} className={`chip ${aiCfg[f.key] === o ? "chip-on" : "chip-off"}`} onClick={() => setAiCfg(p => ({ ...p, [f.key]: o }))} style={{ fontSize: 12, padding: "6px 14px" }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div onClick={() => setAiCfg(p => ({ ...p, auto: !p.auto }))} style={{ width: 44, height: 24, borderRadius: 12, background: aiCfg.auto ? C.teal : C.border, position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.white, position: "absolute", top: 2, left: aiCfg.auto ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navyMid }}>Auto-Publish AI Content</div>
                  <div style={{ fontSize: 11, color: C.slateLight }}>Skip manual review for AI-generated pages</div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyMid, display: "block", marginBottom: 8 }}>Refresh Frequency</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Daily", "Weekly", "Monthly", "On-demand"].map(f => (
                  <button key={f} className={`chip ${aiCfg.refresh === f ? "chip-on" : "chip-off"}`} onClick={() => setAiCfg(p => ({ ...p, refresh: f }))} style={{ fontSize: 12, padding: "6px 14px" }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ background: C.offWhite, borderRadius: 10, padding: 14, marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navyMid, marginBottom: 6 }}>Active Configuration</div>
              <div style={{ fontSize: 12, color: C.slateLight, lineHeight: 1.7 }}>
                Model: <strong style={{ color: C.navyMid }}>{aiCfg.model}</strong> · Tone: <strong style={{ color: C.navyMid }}>{aiCfg.tone}</strong> · SEO: <strong style={{ color: C.navyMid }}>{aiCfg.seo}</strong><br />
                Language: <strong style={{ color: C.navyMid }}>{aiCfg.lang}</strong> · Auto-Publish: <strong style={{ color: aiCfg.auto ? C.teal : C.amberDark }}>{aiCfg.auto ? "Enabled" : "Review Required"}</strong> · Refresh: <strong style={{ color: C.navyMid }}>{aiCfg.refresh}</strong>
              </div>
            </div>

            <button className="btn-amber" style={{ width: "100%" }} onClick={() => setShowAI(false)}>Save Configuration</button>
          </div>
        </div>
      )}

      {/* CTA */}
      <section style={{ padding: "72px 24px", background: C.navy, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, background: `radial-gradient(circle, rgba(245,158,11,.06) 0%, transparent 60%)`, borderRadius: "50%" }} />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <h2 className="serif" style={{ fontSize: 34, fontWeight: 700, color: C.white, marginBottom: 14, lineHeight: 1.15 }}>
            Ready to Find Your <span style={{ color: C.amber }}>Perfect College</span>?
          </h2>
          <p style={{ color: C.slateLight, fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>
            Join 10M+ students who found their path through EduSphere. Free counselling, no obligations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-amber" style={{ padding: "14px 32px", fontSize: 16 }}>Explore Colleges →</button>
            <button className="btn-outline" style={{ padding: "14px 32px", fontSize: 16 }}>Book Free Counselling</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.navy, color: C.slateLight, padding: "48px 24px 20px", borderTop: `1px solid ${C.borderDark}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, background: `linear-gradient(135deg, ${C.amber}, ${C.amberDark})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: C.navy, fontWeight: 700, fontSize: 15 }}>E</div>
                <span className="serif" style={{ fontSize: 18, fontWeight: 700, color: C.white }}>EduSphere</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>India's AI-powered college discovery platform. Find, compare, and apply to 30,000+ colleges.</p>
            </div>
            {[
              { t: "Explore", links: ["Colleges", "Courses", "Exams", "Rankings", "Compare"] },
              { t: "Resources", links: ["Blog", "News", "Predictors", "Counselling", "Application"] },
              { t: "Company", links: ["About Us", "Careers", "Contact", "Privacy", "Terms"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{col.t}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer", transition: "color .2s" }}
                    onMouseEnter={e => e.target.style.color = C.amber}
                    onMouseLeave={e => e.target.style.color = C.slateLight}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.borderDark}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 12 }}>
            <span>© 2026 EduSphere. All rights reserved.</span>
            <span style={{ color: C.amber, fontWeight: 500 }}>Powered by AI SEO Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
