import { useState } from "react";
import { ShoppingBag, Star, TrendingUp, Lock, ChevronRight, Users, CheckCircle2, X, Shield } from "lucide-react";

const REPORTS = [
  { id: 1, analyst: "DataKing_88", avatar: "DK", title: "El Clasico Deep Dive — Tactical & Model Analysis", league: "La Liga", match: "Real Madrid vs Barcelona", price: 4.99, rating: 4.8, reviews: 142, accuracy: "74.2%", badge: "Elite Verified", preview: "Real Madrid enter this fixture with superior xG numbers across their last 8 matches (avg 2.1 vs 1.4). Barcelona's high defensive line presents exploitable space behind...", tags: ["Tactical", "High Confidence", "Pre-Match"], purchased: false },
  { id: 2, analyst: "xGMaster", avatar: "XG", title: "Premier League Matchday 36 — Full Intelligence Pack", league: "Premier League", match: "5 Matches", price: 9.99, rating: 4.6, reviews: 88, accuracy: "71.5%", badge: "Rising Star", preview: "Comprehensive pre-match intelligence for all 5 PL fixtures. Includes xG projections, form analysis, and individual confidence scores for each signal.", tags: ["Multi-Match", "Weekend Pack", "Premium"], purchased: true },
  { id: 3, analyst: "TacticsAI", avatar: "TA", title: "Bayern Munich Form Analysis — Bundesliga Title Run", league: "Bundesliga", match: "Team Report", price: 2.99, rating: 4.5, reviews: 56, accuracy: "70.3%", badge: "Verified", preview: "Bayern have W14 D2 in their last 16 Bundesliga matches. This report breaks down their attacking press, defensive shape, and key personnel metrics.", tags: ["Team Form", "Deep Dive", "Season Long"], purchased: false },
  { id: 4, analyst: "QuantumForm", avatar: "QF", title: "Over 2.5 Goals — Value Signal Report (GW36)", league: "Multi-League", match: "7 Matches", price: 7.99, rating: 4.7, reviews: 201, accuracy: "72.8%", badge: "Premium", preview: "7 high-confidence over 2.5 goals signals across PL, Bundesliga, and La Liga. Model calibration data included with each selection.", tags: ["Goals Market", "Multi-League", "Value"], purchased: false },
  { id: 5, analyst: "StatWizard", avatar: "SW", title: "Champions League Group Stage — All 8 Fixtures", league: "Champions League", match: "8 Matches", price: 12.99, rating: 4.4, reviews: 74, accuracy: "68.5%", badge: "Verified", preview: "Complete UCL group stage intelligence. Win probabilities, draw probability analysis, and BTTS signals for all 8 simultaneous fixtures.", tags: ["UCL", "Multi-Match", "Premium"], purchased: false },
  { id: 6, analyst: "FormCrusher", avatar: "FC", title: "Derby Match Intelligence — High Variance Deep Dive", league: "Multi-League", match: "3 Derby Matches", price: 5.99, rating: 4.3, reviews: 39, accuracy: "69.8%", badge: "Premium", preview: "Derby matches require special model treatment. This report explains variance inflation, calibration adjustments, and recommended risk levels.", tags: ["Derby", "Risk Analysis", "Educational"], purchased: false },
];

const BADGE_COLOR: Record<string, string> = { "Elite Verified": "#f59e0b", "Rising Star": "#10b981", "Premium": "#3b82f6", "Verified": "#a8b8d8" };

export function MarketplacePage() {
  const [selected, setSelected] = useState<typeof REPORTS[0] | null>(null);
  const [filter, setFilter] = useState("All");
  const [purchasing, setPurchasing] = useState(false);

  const tags = ["All", "Tactical", "Multi-Match", "Team Form", "Goals Market", "UCL", "Derby"];
  const filtered = filter === "All" ? REPORTS : REPORTS.filter(r => r.tags.includes(filter));

  if (selected) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
        <button onClick={() => setSelected(null)} style={{ color: "#6b7fa3", fontSize: 14, background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}>← Back to Marketplace</button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {selected.tags.map(t => (
                <span key={t} style={{ background: "rgba(59,130,246,0.08)", color: "#6b7fa3", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 6, padding: "3px 10px", fontSize: 11 }}>{t}</span>
              ))}
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, lineHeight: 1.1, marginBottom: 16 }}>{selected.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #131d3a, #1e2d54)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, color: "#a8b8d8" }}>{selected.avatar}</div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{selected.analyst}</span>
              </div>
              <span style={{ background: `${BADGE_COLOR[selected.badge]}15`, color: BADGE_COLOR[selected.badge], border: `1px solid ${BADGE_COLOR[selected.badge]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{selected.badge}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f59e0b" }}>
                <Star size={12} fill="#f59e0b" /> {selected.rating} ({selected.reviews} reviews)
              </span>
            </div>

            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Report Preview</h3>
              <p style={{ color: "#a8b8d8", fontSize: 14, lineHeight: 1.8 }}>{selected.preview}</p>

              {!selected.purchased && (
                <div style={{ marginTop: 20, position: "relative" }}>
                  <p style={{ color: "#6b7fa3", fontSize: 14, lineHeight: 1.7, filter: "blur(4px)", userSelect: "none" }}>
                    Lorem ipsum dolor sit amet, the model indicates a higher probability for the home side based on recent attacking efficiency. Expected goals differential is +0.68 in favour of the home team. Both teams to score probability elevated at 57%...
                  </p>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(8,12,24,0.6)", backdropFilter: "blur(2px)", borderRadius: 8, gap: 12 }}>
                    <Lock size={24} color="#6b7fa3" />
                    <span style={{ fontSize: 13, color: "#a8b8d8" }}>Purchase to unlock full report</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
              <Shield size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: "#a8b8d8", lineHeight: 1.5 }}>All marketplace reports are verified for responsible language compliance. Past analyst accuracy does not guarantee future results.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 24 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 44, color: "#f0f4ff", marginBottom: 4 }}>${selected.price}</div>
              <div style={{ fontSize: 13, color: "#6b7fa3", marginBottom: 20 }}>One-time purchase · Instant delivery</div>
              {selected.purchased ? (
                <div style={{ width: "100%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, textAlign: "center" }}>
                  <CheckCircle2 size={16} style={{ display: "inline", marginRight: 6 }} /> Purchased — View Full Report
                </div>
              ) : (
                <button onClick={() => setPurchasing(true)} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}>
                  Buy Report →
                </button>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                {[["Accuracy", selected.accuracy, "#10b981"], ["Rating", `${selected.rating}/5`, "#f59e0b"], ["Reviews", selected.reviews.toString(), "#3b82f6"]].map(([l, v, c]) => (
                  <div key={l as string} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: c as string, fontWeight: 500 }}>{v}</div>
                    <div style={{ fontSize: 10, color: "#6b7fa3" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>About {selected.analyst}</h4>
              <div style={{ fontSize: 13, color: "#6b7fa3", marginBottom: 10 }}>Verified accuracy: <span style={{ color: "#10b981", fontWeight: 600 }}>{selected.accuracy}</span></div>
              <div style={{ fontSize: 13, color: "#6b7fa3" }}>{selected.reviews} verified report reviews</div>
            </div>
          </div>
        </div>

        {purchasing && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: 36, maxWidth: 420, width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26 }}>Complete Purchase</h3>
                <button onClick={() => setPurchasing(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#6b7fa3" /></button>
              </div>
              <div style={{ background: "rgba(59,130,246,0.06)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: "#6b7fa3" }}>by {selected.analyst}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(59,130,246,0.1)", marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: "#a8b8d8" }}>Total</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, color: "#f0f4ff" }}>${selected.price}</span>
              </div>
              <button onClick={() => { setPurchasing(false); setSelected({ ...selected, purchased: true }); }} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Pay with Card →
              </button>
              <p style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#6b7fa3" }}>Secured by Stripe. Instant access after payment.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <ShoppingBag size={22} color="#8b5cf6" />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Prediction Marketplace</h1>
          </div>
          <p style={{ color: "#6b7fa3", fontSize: 15 }}>Premium reports from verified analysts — pay per report or subscribe for unlimited access</p>
        </div>
        <button style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
          Publish Your Report →
        </button>
      </div>

      {/* Platform stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[["Reports Published", "1,840", "#8b5cf6"], ["Verified Analysts", "48", "#3b82f6"], ["Platform Revenue Share", "30%", "#10b981"], ["Avg Report Rating", "4.6/5", "#f59e0b"]].map(([l, v, c]) => (
          <div key={l as string} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{l}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filter tags */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tags.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: filter === t ? "#8b5cf6" : "rgba(139,92,246,0.08)", border: `1px solid ${filter === t ? "#8b5cf6" : "rgba(139,92,246,0.2)"}`, color: filter === t ? "#fff" : "#a8b8d8", cursor: "pointer" }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {filtered.map(report => (
          <div
            key={report.id}
            onClick={() => setSelected(report)}
            style={{ background: "#0d1327", border: `1px solid ${report.purchased ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.12)"}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = report.purchased ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.12)")}
          >
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ background: `${BADGE_COLOR[report.badge]}15`, color: BADGE_COLOR[report.badge], border: `1px solid ${BADGE_COLOR[report.badge]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{report.badge}</span>
                <span style={{ background: "rgba(59,130,246,0.06)", color: "#6b7fa3", borderRadius: 6, padding: "2px 8px", fontSize: 10 }}>{report.league}</span>
                {report.purchased && <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>✓ Purchased</span>}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, lineHeight: 1.3 }}>{report.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #131d3a, #1e2d54)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, color: "#a8b8d8" }}>{report.avatar}</div>
                <span style={{ fontSize: 12, color: "#a8b8d8" }}>{report.analyst}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#f59e0b", marginLeft: "auto" }}>
                  <Star size={10} fill="#f59e0b" /> {report.rating} ({report.reviews})
                </span>
              </div>
              <p style={{ color: "#6b7fa3", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{report.preview.slice(0, 100)}...</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, color: "#f0f4ff" }}>${report.price}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8b5cf6", fontSize: 13, fontWeight: 600 }}>View Report <ChevronRight size={14} /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
