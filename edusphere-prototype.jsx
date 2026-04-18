import { useState, useEffect, useRef } from "react";

const COLLEGES = [
  { name: "IIT Bombay", city: "Mumbai", type: "IIT", rating: 4.8, rank: 1, fees: "₹2.2L/yr", courses: 45, img: "🏛️", naac: "A++", placements: "₹30L avg" },
  { name: "IIT Delhi", city: "Delhi", type: "IIT", rating: 4.7, rank: 2, fees: "₹2.1L/yr", courses: 40, img: "🎓", naac: "A++", placements: "₹28L avg" },
  { name: "IIT Madras", city: "Chennai", type: "IIT", rating: 4.9, rank: 3, fees: "₹2.0L/yr", courses: 38, img: "🏫", naac: "A++", placements: "₹32L avg" },
  { name: "BITS Pilani", city: "Pilani", type: "Private", rating: 4.6, rank: 4, fees: "₹5.5L/yr", courses: 30, img: "⭐", naac: "A+", placements: "₹22L avg" },
  { name: "NIT Trichy", city: "Trichy", type: "NIT", rating: 4.5, rank: 5, fees: "₹1.8L/yr", courses: 28, img: "📚", naac: "A+", placements: "₹18L avg" },
  { name: "VIT Vellore", city: "Vellore", type: "Private", rating: 4.3, rank: 6, fees: "₹3.2L/yr", courses: 50, img: "🎯", naac: "A++", placements: "₹12L avg" },
];

const EXAMS = ["JEE Main", "JEE Advanced", "NEET UG", "CAT", "GATE", "CUET", "CLAT", "BITSAT"];
const COURSES = ["B.Tech", "MBA", "MBBS", "B.Com", "BA", "BBA", "M.Tech", "MCA", "LLB", "B.Sc"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur"];

const STATS = [
  { num: "30,000+", label: "Colleges Listed", icon: "🏫" },
  { num: "500+", label: "Exams Covered", icon: "📝" },
  { num: "2M+", label: "Pages Indexed", icon: "🔍" },
  { num: "10M+", label: "Students Guided", icon: "👩‍🎓" },
];

const SEO_CONFIG = {
  models: ["Claude Sonnet 4", "Claude Opus 4", "GPT-4o", "Gemini 2.0 Pro"],
  tones: ["Professional", "Student-Friendly", "Conversational", "Academic"],
  seoLevels: ["Low (Natural)", "Medium (Balanced)", "High (Keyword-Dense)"],
  languages: ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali"],
};

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""));
    const step = Math.ceil(num / 40);
    let c = 0;
    const timer = setInterval(() => {
      c += step;
      if (c >= num) { c = num; clearInterval(timer); }
      setCount(c);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);

  const formatted = count.toLocaleString("en-IN");
  return <span ref={ref}>{formatted}{suffix}</span>;
}

export default function EduSphere() {
  const [activeTab, setActiveTab] = useState("colleges");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi! I'm EduSphere AI. Tell me your exam score, preferred city, and budget — I'll find the perfect college for you." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiConfig, setAiConfig] = useState({
    model: "Claude Sonnet 4",
    tone: "Student-Friendly",
    seoLevel: "Medium (Balanced)",
    autoPublish: false,
    language: "English",
    refreshFreq: "Weekly",
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [compareList, setCompareList] = useState([]);

  const handleChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", text: chatInput }]);
    const reply = chatInput.toLowerCase().includes("jee")
      ? "Based on JEE scores, I'd recommend IIT Bombay (Rank 1), IIT Delhi (Rank 2), or IIT Madras (Rank 3). Want me to compare placements and fees across these?"
      : chatInput.toLowerCase().includes("mba")
      ? "For MBA, top picks are IIM Ahmedabad, IIM Bangalore, and ISB Hyderabad. What's your CAT percentile? I can predict your admission chances."
      : "I can help you find the right college! Please share your exam (JEE/NEET/CAT), expected score, preferred city, and annual budget.";
    setTimeout(() => setChatMessages(prev => [...prev, { role: "ai", text: reply }]), 600);
    setChatInput("");
  };

  const toggleCompare = (name) => {
    setCompareList(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#FAFBFC", minHeight: "100vh", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(26,86,219,0.15); } 50% { box-shadow: 0 0 40px rgba(26,86,219,0.3); } }
        .fade-up { animation: fadeUp 0.6s ease-out both; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .btn-primary { background: linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 15px; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,86,219,0.35); }
        .btn-ghost { background: transparent; color: #1A56DB; border: 2px solid #1A56DB; padding: 10px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 15px; }
        .btn-ghost:hover { background: #EBF5FF; }
        .tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .nav-link { color: #4B5563; text-decoration: none; font-weight: 500; font-size: 15px; transition: color 0.2s; cursor: pointer; }
        .nav-link:hover { color: #1A56DB; }
        .input-search { width: 100%; padding: 16px 20px 16px 48px; border: 2px solid #E5E7EB; border-radius: 16px; font-size: 16px; outline: none; transition: all 0.3s; background: white; }
        .input-search:focus { border-color: #1A56DB; box-shadow: 0 0 0 4px rgba(26,86,219,0.1); }
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        .section-sub { color: #6B7280; font-size: 16px; margin-bottom: 32px; }
        .chip { padding: 8px 20px; border-radius: 24px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
        .chip-active { background: #1A56DB; color: white; }
        .chip-inactive { background: #F3F4F6; color: #6B7280; }
        .chip-inactive:hover { background: #E5E7EB; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E5E7EB", padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #1A56DB, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18 }}>E</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#111827" }}>EduSphere</span>
            <span className="tag" style={{ background: "#EBF5FF", color: "#1A56DB", marginLeft: 4 }}>AI</span>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Colleges", "Courses", "Exams", "Rankings", "Compare"].map(item => (
              <span key={item} className="nav-link" style={{ display: window.innerWidth < 768 ? "none" : "inline" }}>{item}</span>
            ))}
            <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => setShowAIPanel(!showAIPanel)}>
              ⚙️ AI Engine
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 24px 60px", background: "linear-gradient(135deg, #EBF5FF 0%, #F5F3FF 50%, #FFF7ED 100%)" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(26,86,219,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -50, left: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="tag stagger-1" style={{ background: "#DCFCE7", color: "#166534", marginBottom: 16 }}>🚀 India's #1 AI-Powered College Discovery Platform</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, color: "#111827" }}>
            Find Your <span style={{ background: "linear-gradient(135deg, #1A56DB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Perfect College</span><br />with AI Precision
          </h1>
          <p className="stagger-2" style={{ fontSize: 18, color: "#6B7280", maxWidth: 580, margin: "0 auto 32px", lineHeight: 1.6 }}>
            30,000+ colleges. 500+ exams. 2M+ pages of verified data. Powered by AI that understands your goals.
          </p>
          <div className="stagger-3" style={{ position: "relative", maxWidth: 640, margin: "0 auto 24px" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>🔍</span>
            <input
              className="input-search"
              placeholder="Search colleges, courses, exams, cities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="btn-primary" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", padding: "10px 24px", borderRadius: 12 }}>Search</button>
          </div>
          <div className="stagger-4" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["MBA in Bangalore", "Top IITs", "NEET Colleges", "B.Tech CS"].map(q => (
              <button key={q} className="chip chip-inactive" onClick={() => setSearchQuery(q)}>{q}</button>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          {STATS.map((s, i) => (
            <div key={i} className="fade-up" style={{ textAlign: "center", animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#1A56DB" }}>
                <AnimatedCounter target={s.num} suffix="+" />
              </div>
              <div style={{ color: "#6B7280", fontSize: 14, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BROWSE TABS */}
      <section style={{ padding: "60px 24px", maxWidth: 1280, margin: "0 auto" }}>
        <div className="section-title">Explore India's Best Colleges</div>
        <div className="section-sub">Discover, compare, and apply — all in one place</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {[
            { id: "colleges", label: "🏫 Top Colleges" },
            { id: "courses", label: "📖 Courses" },
            { id: "exams", label: "📝 Exams" },
            { id: "cities", label: "🌆 By City" },
          ].map(tab => (
            <button key={tab.id} className={`chip ${activeTab === tab.id ? "chip-active" : "chip-inactive"}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "colleges" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {COLLEGES.map((c, i) => (
              <div key={i} className="card-hover fade-up" style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #E5E7EB", animationDelay: `${i * 0.08}s`, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{c.img}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{c.name}</h3>
                    <p style={{ color: "#6B7280", fontSize: 14 }}>{c.city} • {c.type}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tag" style={{ background: "#FEF3C7", color: "#92400E" }}>#{c.rank}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#6B7280" }}>⭐ {c.rating}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Fees", val: c.fees },
                    { label: "NAAC", val: c.naac },
                    { label: "Placements", val: c.placements },
                  ].map((d, j) => (
                    <div key={j} style={{ background: "#F9FAFB", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>{d.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{d.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" style={{ flex: 1, padding: "10px 16px", fontSize: 13 }}>View Details</button>
                  <button
                    className="btn-ghost"
                    style={{ padding: "10px 16px", fontSize: 13, background: compareList.includes(c.name) ? "#EBF5FF" : "transparent" }}
                    onClick={() => toggleCompare(c.name)}
                  >
                    {compareList.includes(c.name) ? "✓ Added" : "Compare"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {COURSES.map((c, i) => (
              <div key={i} className="card-hover fade-up" style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #E5E7EB", textAlign: "center", cursor: "pointer", animationDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📖</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{c}</div>
                <div style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>{Math.floor(Math.random() * 3000 + 500)} colleges</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "exams" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {EXAMS.map((e, i) => (
              <div key={i} className="card-hover fade-up" style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 44, height: 44, background: "#EBF5FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{e}</div>
                  <div style={{ color: "#6B7280", fontSize: 13 }}>Registration Open</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "cities" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {CITIES.map((c, i) => (
              <div key={i} className="card-hover fade-up" style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #E5E7EB", textAlign: "center", cursor: "pointer", animationDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🌆</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{c}</div>
                <div style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>{Math.floor(Math.random() * 500 + 100)} colleges</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COMPARE BAR */}
      {compareList.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "2px solid #1A56DB", padding: "12px 24px", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, animation: "fadeUp 0.3s ease-out" }}>
          <span style={{ fontWeight: 600, color: "#1A56DB" }}>Compare ({compareList.length}/3):</span>
          {compareList.map(n => (
            <span key={n} className="tag" style={{ background: "#EBF5FF", color: "#1A56DB", cursor: "pointer" }} onClick={() => toggleCompare(n)}>{n} ✕</span>
          ))}
          {compareList.length >= 2 && <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>Compare Now →</button>}
        </div>
      )}

      {/* AI COUNSELOR */}
      <section style={{ padding: "60px 24px", background: "linear-gradient(135deg, #1E3A5F 0%, #1A1A2E 100%)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="tag" style={{ background: "rgba(26,86,219,0.2)", color: "#93C5FD", marginBottom: 12 }}>🤖 AI-Powered</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: "white", marginBottom: 8 }}>AI College Counselor</div>
            <div style={{ color: "#94A3B8", fontSize: 16 }}>Get personalized recommendations based on your profile, scores & preferences</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", animation: "glow 3s ease-in-out infinite" }}>
            <div style={{ padding: 20, maxHeight: 300, overflowY: "auto" }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12, animation: "slideIn 0.3s ease-out" }}>
                  <div style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "#1A56DB" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    {m.role === "ai" && <span style={{ marginRight: 6 }}>🤖</span>}
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChat()}
                placeholder="Ask about colleges, courses, exams..."
                style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none" }}
              />
              <button className="btn-primary" onClick={handleChat} style={{ padding: "12px 24px" }}>Send</button>
            </div>
          </div>
        </div>
      </section>

      {/* SEO ENGINE METRICS */}
      <section style={{ padding: "60px 24px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="tag" style={{ background: "#F3E8FF", color: "#7C3AED", marginBottom: 12 }}>⚡ SEO Engine</div>
            <div className="section-title">Built for Search Dominance</div>
            <div className="section-sub">Our AI-powered SEO engine generates and optimizes 2M+ pages automatically</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: "🔄", title: "Programmatic Pages", desc: "Auto-generate unique pages for every college + course + city combo. 2M+ indexed pages with unique AI content.", metric: "2,000,000+" },
              { icon: "🧠", title: "AI Content Pipeline", desc: "6-stage pipeline: Research → Brief → Generate → Review → Publish → Monitor. 5,000+ pages/day.", metric: "5K/day" },
              { icon: "📊", title: "Schema Markup", desc: "JSON-LD structured data on every page: FAQPage, Review, Course, Event, BreadcrumbList.", metric: "15+ types" },
              { icon: "🔗", title: "Internal Linking", desc: "AI-powered contextual interlinking. Hub-and-spoke model with automated related content blocks.", metric: "10M+ links" },
              { icon: "⚡", title: "Core Web Vitals", desc: "LCP < 1.5s, FID < 50ms, CLS < 0.05. ISR + edge caching + critical CSS inlining.", metric: "100/100" },
              { icon: "📈", title: "Rank Tracking", desc: "Real-time ranking, CTR, and traffic monitoring. Auto-refresh for underperforming pages.", metric: "24/7" },
            ].map((item, i) => (
              <div key={i} className="card-hover fade-up" style={{ background: "#FAFBFC", borderRadius: 16, padding: 24, border: "1px solid #E5E7EB", animationDelay: `${i * 0.08}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div style={{ fontSize: 28 }}>{item.icon}</div>
                  <span className="tag" style={{ background: "#EBF5FF", color: "#1A56DB" }}>{item.metric}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#111827" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMMATIC URL EXAMPLES */}
      <section style={{ padding: "60px 24px", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="section-title">Programmatic SEO URLs</div>
            <div className="section-sub">Every combination generates a unique, optimized page</div>
          </div>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }}>
            {[
              { pattern: "/colleges/{slug}", example: "/colleges/iit-bombay", pages: "30K+" },
              { pattern: "/courses/{course}-in-{city}", example: "/courses/mba-in-bangalore", pages: "50K+" },
              { pattern: "/compare/{c1}-vs-{c2}", example: "/compare/iit-bombay-vs-iit-delhi", pages: "1M+" },
              { pattern: "/{course}-colleges-in-{state}", example: "/engineering-colleges-in-maharashtra", pages: "5K+" },
              { pattern: "/exams/{slug}", example: "/exams/jee-main", pages: "500+" },
              { pattern: "/rankings/{category}", example: "/rankings/top-engineering-colleges", pages: "2K+" },
            ].map((url, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: i < 5 ? "1px solid #F3F4F6" : "none", gap: 16 }}>
                <code style={{ flex: 1, fontSize: 13, color: "#7C3AED", background: "#F5F3FF", padding: "6px 12px", borderRadius: 8, fontFamily: "monospace" }}>{url.pattern}</code>
                <span style={{ flex: 1.2, fontSize: 13, color: "#6B7280" }}>{url.example}</span>
                <span className="tag" style={{ background: "#DCFCE7", color: "#166534", minWidth: 60, textAlign: "center" }}>{url.pages}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CONFIG PANEL (MODAL) */}
      {showAIPanel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowAIPanel(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: 32, animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700 }}>⚙️ AI Engine Configuration</h2>
                <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>Tune the AI behavior for content, SEO, and recommendations</p>
              </div>
              <button onClick={() => setShowAIPanel(false)} style={{ background: "#F3F4F6", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            {[
              { label: "AI Model", key: "model", options: SEO_CONFIG.models },
              { label: "Content Tone", key: "tone", options: SEO_CONFIG.tones },
              { label: "SEO Aggressiveness", key: "seoLevel", options: SEO_CONFIG.seoLevels },
              { label: "Language", key: "language", options: SEO_CONFIG.languages },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{field.label}</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {field.options.map(opt => (
                    <button
                      key={opt}
                      className={`chip ${aiConfig[field.key] === opt ? "chip-active" : "chip-inactive"}`}
                      onClick={() => setAiConfig(prev => ({ ...prev, [field.key]: opt }))}
                      style={{ fontSize: 13 }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => setAiConfig(prev => ({ ...prev, autoPublish: !prev.autoPublish }))}
                  style={{
                    width: 48, height: 26, borderRadius: 13,
                    background: aiConfig.autoPublish ? "#1A56DB" : "#D1D5DB",
                    position: "relative", cursor: "pointer", transition: "background 0.2s"
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: "white",
                    position: "absolute", top: 2,
                    left: aiConfig.autoPublish ? 24 : 2,
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Auto-Publish AI Content</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>Content goes live without manual review</div>
                </div>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", minWidth: 120, paddingTop: 10 }}>Refresh Freq</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Daily", "Weekly", "Monthly", "On-demand"].map(f => (
                  <button
                    key={f}
                    className={`chip ${aiConfig.refreshFreq === f ? "chip-active" : "chip-inactive"}`}
                    onClick={() => setAiConfig(prev => ({ ...prev, refreshFreq: f }))}
                    style={{ fontSize: 13 }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Current Config Summary</div>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.8 }}>
                Model: <strong>{aiConfig.model}</strong> · Tone: <strong>{aiConfig.tone}</strong> · SEO: <strong>{aiConfig.seoLevel}</strong><br />
                Lang: <strong>{aiConfig.language}</strong> · Auto-Publish: <strong>{aiConfig.autoPublish ? "Yes" : "No (Review Required)"}</strong> · Refresh: <strong>{aiConfig.refreshFreq}</strong>
              </div>
            </div>

            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setShowAIPanel(false)}>Save Configuration</button>
          </div>
        </div>
      )}

      {/* CTA */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, #1A56DB 0%, #7C3AED 100%)", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: "white", marginBottom: 16 }}>Start Your College Journey Today</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Join 10M+ students who found their perfect college through EduSphere's AI-powered platform.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ background: "white", color: "#1A56DB", border: "none", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Explore Colleges →</button>
            <button style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "2px solid rgba(255,255,255,0.3)", padding: "14px 32px", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Talk to AI Counselor</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111827", color: "#9CA3AF", padding: "48px 24px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #1A56DB, #7C3AED)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16 }}>E</div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "white" }}>EduSphere</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>India's AI-powered college discovery platform. Find, compare, and apply to 30,000+ colleges.</p>
            </div>
            {[
              { title: "Explore", links: ["Colleges", "Courses", "Exams", "Rankings", "Compare"] },
              { title: "Resources", links: ["Blog", "News", "Predictors", "Counseling", "Application Form"] },
              { title: "Company", links: ["About Us", "Careers", "Contact", "Privacy Policy", "Terms of Service"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{col.title}</div>
                {col.links.map(link => (
                  <div key={link} style={{ fontSize: 14, marginBottom: 8, cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#93C5FD"}
                    onMouseLeave={e => e.target.style.color = "#9CA3AF"}
                  >{link}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1F2937", paddingTop: 16, textAlign: "center", fontSize: 13 }}>
            © 2026 EduSphere. All rights reserved. Built with AI-powered SEO Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
