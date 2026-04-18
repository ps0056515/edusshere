import Link from "next/link";
import { GuidanceLeadForm } from "@/components/GuidanceLeadForm";
import { CollegeDetailActions } from "@/components/CollegeDetailActions";
import type { CollegeRow } from "@/lib/colleges-index";
import {
  buildDemoYearlyPlacement,
  buildProsCons,
  buildStrengths,
  directoryRankBand,
  parseFeesHint,
} from "@/lib/college-detail-insights";
import "./college-detail.css";

const C = {
  navy: "#0B1120",
  navyMid: "#0F172A",
  slate: "#334155",
  slateLight: "#94A3B8",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  amber: "#F59E0B",
  amberDark: "#D97706",
  amberLight: "#FEF3C7",
  teal: "#10B981",
  tealLight: "#D1FAE5",
  border: "#E2E8F0",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#991B1B",
  okBg: "#ECFDF5",
  okBorder: "#A7F3D0",
  okText: "#065F46",
} as const;

function MiniPlacementBars({ stats }: { stats: ReturnType<typeof buildDemoYearlyPlacement> }) {
  const maxMed = Math.max(...stats.map((s) => s.medianLakh), 0.1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
      {stats.map((s) => (
        <div key={s.year}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: C.slate }}>
            <span style={{ fontWeight: 700, color: C.navyMid }}>{s.year}</span>
            <span>
              Median <strong style={{ color: C.amberDark }}>₹{s.medianLakh}L</strong>
              <span style={{ color: C.slateLight, fontWeight: 500 }}> · High ₹{s.highestLakh}L · ~{s.placedPct}% placed</span>
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: C.offWhite, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, (s.medianLakh / maxMed) * 100)}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${C.amber}, ${C.amberDark})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollegeDetailPremium({ college, similar }: { college: CollegeRow; similar: CollegeRow[] }) {
  const feeHint = parseFeesHint(college.fees);
  const rankBand = directoryRankBand(college.rank);
  const strengths = buildStrengths(college);
  const { pros, cons } = buildProsCons(college);
  const yearly = buildDemoYearlyPlacement(college);

  const chip = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,.18)",
    color: "rgba(255,255,255,.92)",
    background: "rgba(255,255,255,.06)",
  } as const;

  return (
    <div style={{ minHeight: "100vh", background: C.offWhite, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <section className="college-detail-hero-mesh" style={{ padding: "32px 24px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <Link href="/#section-explore" style={{ fontSize: 14, color: C.slateLight, fontWeight: 600, textDecoration: "none" }}>
            ← Back to directory
          </Link>

          <div className="college-detail-fade-up" style={{ marginTop: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(245,158,11,.12)",
                border: "1px solid rgba(245,158,11,.35)",
                color: C.amber,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase" as const,
                marginBottom: 16,
              }}
            >
              College profile
            </div>
            <h1
              className="college-detail-fade-up college-detail-delay-1"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(28px, 4.5vw, 44px)",
                fontWeight: 700,
                color: C.white,
                lineHeight: 1.15,
                margin: "0 0 14px",
                maxWidth: 900,
              }}
            >
              {college.name}
            </h1>
            <p className="college-detail-fade-up college-detail-delay-1" style={{ color: "rgba(148,163,184,.95)", fontSize: 17, margin: 0, maxWidth: 640 }}>
              {college.city}, {college.district} · {college.state}
            </p>
            <div className="college-detail-fade-up college-detail-delay-2" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              <span style={chip}>{college.type}</span>
              <span style={chip}>⭐ {college.rating.toFixed(1)} / 5</span>
              {college.rank > 0 ? <span style={chip}>Directory rank #{college.rank}</span> : <span style={chip}>Imported listing</span>}
              <span style={chip}>NAAC {college.naac}</span>
            </div>
            <div className="college-detail-fade-up college-detail-delay-3" style={{ marginTop: 28 }}>
              <CollegeDetailActions collegeId={college.id} collegeName={college.name} />
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px 64px" }}>
        <p
          className="college-detail-fade-up"
          style={{
            fontSize: 13,
            color: C.slate,
            lineHeight: 1.65,
            padding: "14px 18px",
            borderRadius: 12,
            background: C.amberLight,
            border: `1px solid rgba(245,158,11,.35)`,
            marginBottom: 28,
          }}
        >
          <strong style={{ color: C.amberDark }}>Demo directory.</strong> Rankings, placement trends, and scores on this page are for layout and
          exploration only — always verify fees, approvals, cutoffs, and placement disclosures on the{" "}
          <strong>official college or university website</strong> before you decide.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 300px",
            gap: 28,
            alignItems: "start",
          }}
          className="college-detail-layout"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              <div
                className="college-detail-bento-hover college-detail-fade-up"
                style={{
                  gridColumn: "span 1",
                  background: C.white,
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  padding: 22,
                  minHeight: 200,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: C.slateLight, letterSpacing: ".08em", marginBottom: 10 }}>RANKINGS & LISTING</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: C.navyMid }}>{rankBand.label}</div>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.55, marginTop: 10 }}>{rankBand.caption}</p>
                <div style={{ marginTop: 16, fontSize: 13, color: C.slateLight }}>
                  Official NIRF / other ranks are <strong style={{ color: C.navyMid }}>not</strong> embedded in this demo feed — add your data source to
                  show real bands here.
                </div>
              </div>

              <div
                className="college-detail-bento-hover college-detail-fade-up college-detail-delay-1"
                style={{
                  background: C.white,
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  padding: 22,
                  minHeight: 200,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: C.slateLight, letterSpacing: ".08em", marginBottom: 10 }}>PLACEMENT PULSE</div>
                <div style={{ fontSize: 15, color: C.slate, lineHeight: 1.55 }}>
                  Latest row in directory: <strong style={{ color: C.navyMid }}>{college.placements}</strong>
                </div>
                <p style={{ fontSize: 12, color: C.slateLight, marginTop: 12, lineHeight: 1.5 }}>
                  Indicative multi-year trend below is <strong>synthetic</strong> (seeded from this record) so parents can see how a rich UI would look
                  once you plug audited placement PDFs.
                </p>
                <MiniPlacementBars stats={yearly} />
              </div>

              <div
                className="college-detail-bento-hover college-detail-fade-up college-detail-delay-2"
                style={{
                  gridColumn: "span 1",
                  background: `linear-gradient(145deg, ${C.navyMid} 0%, #1e293b 100%)`,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,.08)",
                  padding: 22,
                  minHeight: 200,
                  color: C.white,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: ".08em", marginBottom: 10 }}>GOOD AT</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.65, color: "rgba(248,250,252,.92)" }}>
                  {strengths.map((s, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="college-detail-bento-hover college-detail-fade-up college-detail-delay-3"
                style={{
                  background: C.white,
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: C.slateLight, letterSpacing: ".08em", marginBottom: 10 }}>ENTRANCES & PROGRAMMES</div>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.55, margin: "0 0 12px" }}>
                  <strong style={{ color: C.navyMid }}>Accepts:</strong> {college.accept}
                </p>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.55, margin: 0 }}>{college.courses}</p>
              </div>
            </div>

            <div
              className="college-detail-fade-up college-detail-procon-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: C.okBg,
                  border: `1px solid ${C.okBorder}`,
                  borderRadius: 18,
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: C.okText, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>✓</span> What&apos;s working for you
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: C.slate, fontSize: 14, lineHeight: 1.65 }}>
                  {pros.map((p, i) => (
                    <li key={i} style={{ marginBottom: 10 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                style={{
                  background: C.dangerBg,
                  border: `1px solid ${C.dangerBorder}`,
                  borderRadius: 18,
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: C.dangerText, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>!</span> Watch-outs
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: C.slate, fontSize: 14, lineHeight: 1.65 }}>
                  {cons.map((p, i) => (
                    <li key={i} style={{ marginBottom: 10 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="college-detail-fade-up" style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: 26 }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>
                Fees &amp; total cost snapshot
              </div>
              <p style={{ fontSize: 13, color: C.slateLight, marginBottom: 20 }}>{feeHint.note}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.slateLight, fontWeight: 700 }}>ANNUAL TUITION (INDICATIVE)</div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: C.navyMid, marginTop: 6 }}>{feeHint.annual}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.slateLight, fontWeight: 700 }}>HOSTEL &amp; MESS</div>
                  <div style={{ fontWeight: 600, marginTop: 6, color: C.slate, fontSize: 15 }}>Varies by campus — confirm on prospectus</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.slateLight, fontWeight: 700 }}>SCHOLARSHIPS</div>
                  <div style={{ marginTop: 6, color: C.slate, fontSize: 14, lineHeight: 1.55 }}>
                    Merit, sports, and state schemes may apply — eligibility changes yearly.
                  </div>
                </div>
              </div>
            </div>

            <GuidanceLeadForm variant="card" collegeId={college.id} collegeName={college.name} />

            {similar.length > 0 && (
              <div className="college-detail-fade-up">
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>
                  Similar colleges
                </h2>
                <p style={{ fontSize: 14, color: C.slateLight, marginBottom: 16 }}>Same district or state — quick lateral browsing.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/colleges/detail?id=${encodeURIComponent(s.id)}`}
                      className="college-detail-bento-hover"
                      style={{
                        display: "block",
                        padding: 18,
                        borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        textDecoration: "none",
                        color: C.navyMid,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.slateLight, marginTop: 6 }}>
                        {s.district}, {s.state} · {s.type}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: C.amberDark }}>View profile →</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside
            className="college-detail-fade-up college-detail-sidebar"
            style={{
              position: "sticky",
              top: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.slateLight, letterSpacing: ".06em", marginBottom: 12 }}>QUICK SCAN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.slateLight }}>PLACEMENT (ROW)</div>
                  <div style={{ fontWeight: 700, color: C.navyMid }}>{college.placements}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.slateLight }}>FEE (ROW)</div>
                  <div style={{ fontWeight: 700, color: C.navyMid }}>{feeHint.annual}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.slateLight }}>EXAMS</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.slate, lineHeight: 1.45 }}>{college.accept}</div>
                </div>
              </div>
            </div>
            <div style={{ background: C.tealLight, borderRadius: 16, border: `1px solid rgba(16,185,129,.25)`, padding: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.navyMid, marginBottom: 8 }}>Talk it through</div>
              <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.55, margin: "0 0 12px" }}>
                Open the AI counsellor on the home page with your exam and scores in mind.
              </p>
              <Link
                href={`/?counsellor=1`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: C.teal,
                  color: C.white,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Open AI counsellor
              </Link>
            </div>
            <GuidanceLeadForm variant="compact" collegeId={college.id} collegeName={college.name} />
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .college-detail-layout {
            grid-template-columns: 1fr !important;
          }
          .college-detail-sidebar {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 640px) {
          .college-detail-procon-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
