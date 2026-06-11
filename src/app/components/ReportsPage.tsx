import { useState } from "react";
import { FileText, Calendar, ChevronRight, ArrowLeft, AlertTriangle, TrendingUp } from "lucide-react";

type Page = "landing" | "pricing" | "login" | "register" | "dashboard" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";
interface Props { onNavigate: (page: Page) => void; }

const REPORT_CATEGORIES = ["All", "Daily Brief", "Match Previews", "Team Form", "Tactical", "Injury Impact", "Personalized"];

const REPORTS = [
  {
    id: 1, title: "Daily Intelligence Brief — June 11", category: "Daily Brief",
    match: "All Leagues", time: "06:00 AM", confidence: "High",
    summary: "14 matches analyzed across 6 leagues. 6 high-confidence signals. Key focus: PL Matchday 36, Bundesliga finale, La Liga title race.",
    content: `Today's model identified 6 high-confidence signals from 14 matches across major European leagues. The strongest signal of the day comes from the Bundesliga where Bayern Munich host Dortmund — high home advantage, superior form, and low fixture congestion contribute to a 62% home win probability with High confidence.\n\nPremier League highlights include Manchester City vs Chelsea (58% home win, High confidence, Medium risk) and Arsenal vs Tottenham where the model signals a more balanced contest (48%/26%/26%).\n\nSerie A: Inter Milan vs AC Milan Derby — elevated risk due to historical variance in derby matches, though Inter hold a marginal edge at 51% home win probability.\n\nRisk distribution today: 43% Low Risk, 36% Medium Risk, 21% High Risk. We recommend focusing on the 6 High Confidence, Low-to-Medium Risk signals for analytical purposes.`,
    keyFactors: ["Premier League: Manchester City strong home form", "Bundesliga: Bayern Munich dominant season form", "Serie A: Milan derby high variance flag", "Over 2.5 goals probability elevated across PL matches"],
  },
  {
    id: 2, title: "El Clasico Tactical Preview", category: "Match Previews",
    match: "La Liga: Real Madrid vs Barcelona", time: "08:30 AM", confidence: "Medium",
    summary: "Deep tactical analysis of the La Liga Clasico. Form divergence identified. High variance match — treat with appropriate caution.",
    content: `The La Liga Clasico presents one of the most analytically complex fixtures of the season. Form divergence is the key signal — Real Madrid have won 4 of their last 6 in all competitions while Barcelona have shown inconsistent away form.\n\nModel probability distribution: Home win 45%, Draw 28%, Away win 27% — the tight split reflects genuine uncertainty and a high-variance historical matchup profile.\n\nKey factors: Bellingham's influence in central areas, Barcelona's pressing intensity, and the tactical battle between Ancelotti's defensive structure and Flick's aggressive press. Weather conditions neutral. Both squads near full strength.`,
    keyFactors: ["Tight probability distribution — genuine match uncertainty", "High variance historical H2H profile", "Both teams near full strength", "Tactical battle: defensive shape vs aggressive press"],
  },
  {
    id: 3, title: "Bayern Munich — Season Form Summary", category: "Team Form",
    match: "Bundesliga", time: "09:15 AM", confidence: "High",
    summary: "Comprehensive form analysis for Bayern Munich entering the final Bundesliga matchday. Dominant attacking metrics throughout.",
    content: "",
    keyFactors: ["W14 D2 L0 in last 16 Bundesliga matches", "3.1 xG per match — highest in league", "Defensive record: 0.7 goals conceded per match", "Home unbeaten run: 18 matches"],
  },
];

export function ReportsPage({ onNavigate }: Props) {
  const [selected, setSelected] = useState<typeof REPORTS[0] | null>(null);
  const [category, setCategory] = useState("All");

  const filtered = REPORTS.filter(r => category === "All" || r.category === category);

  if (selected) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
        <button
          onClick={() => setSelected(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7fa3", fontSize: 14, background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}
        >
          <ArrowLeft size={16} /> Back to Reports
        </button>

        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Report header */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: "32px", marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <ConfBadge level={selected.confidence} />
              <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{selected.category}</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, lineHeight: 1.1, marginBottom: 12 }}>{selected.title}</h1>
            <div style={{ display: "flex", gap: 16, color: "#6b7fa3", fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> June 11, 2026 · {selected.time}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={13} /> {selected.match}</span>
            </div>
          </div>

          {/* Prediction summary */}
          <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>Report Summary</h3>
            <p style={{ color: "#a8b8d8", fontSize: 15, lineHeight: 1.7 }}>{selected.summary}</p>
          </div>

          {/* Main content */}
          {selected.content && (
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 20 }}>AI-Generated Analysis</h3>
              {selected.content.split("\n\n").map((para, i) => (
                <p key={i} style={{ color: "#a8b8d8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{para}</p>
              ))}
            </div>
          )}

          {/* Key factors */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Key Analytical Factors</h3>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {selected.keyFactors.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#a8b8d8" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 7 }} /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 20, display: "flex", gap: 12 }}>
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: "#a8b8d8", fontSize: 13, lineHeight: 1.6 }}>
              <strong style={{ color: "#f59e0b" }}>Risk Disclaimer:</strong> All analysis represents model probability estimates for informational purposes only. Past model performance does not guarantee future accuracy. This is not investment or gambling advice. Use responsibly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, marginBottom: 4 }}>AI Intelligence Reports</h1>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Daily match intelligence, form summaries, and tactical observations</p>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {REPORT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: category === cat ? "#3b82f6" : "rgba(59,130,246,0.08)",
              border: `1px solid ${category === cat ? "#3b82f6" : "rgba(59,130,246,0.2)"}`,
              color: category === cat ? "#fff" : "#a8b8d8",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {filtered.map(report => (
          <div
            key={report.id}
            style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }}
            onClick={() => setSelected(report)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.12)")}
          >
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <ConfBadge level={report.confidence} />
                <span style={{ background: "rgba(59,130,246,0.08)", color: "#6b7fa3", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{report.category}</span>
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, lineHeight: 1.4 }}>{report.title}</h3>
              <div style={{ fontSize: 12, color: "#6b7fa3", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={11} /> {report.time} · {report.match}
              </div>
              <p style={{ color: "#a8b8d8", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{report.summary}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, color: "#3b82f6", fontSize: 13, fontWeight: 600 }}>
                Read Report <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfBadge({ level }: { level: string }) {
  const c: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  return (
    <span style={{ background: `${c[level]}18`, color: c[level], border: `1px solid ${c[level]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {level} Confidence
    </span>
  );
}
