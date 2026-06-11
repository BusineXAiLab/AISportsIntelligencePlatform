import { MapPin, Clock, Cloud, UserX, Star, Send, FileText, AlertTriangle, Info } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";

type Page = "landing" | "pricing" | "login" | "register" | "dashboard" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";

interface Props { onNavigate: (page: Page) => void; }

const PROB_DATA = [
  { name: "Home Win", value: 58, color: "#3b82f6" },
  { name: "Draw", value: 24, color: "#f59e0b" },
  { name: "Away Win", value: 18, color: "#6b7fa3" },
  { name: "Over 2.5", value: 64, color: "#10b981" },
  { name: "BTTS", value: 52, color: "#8b5cf6" },
];

const FACTORS = [
  { label: "Recent Form (Home)", score: 82, color: "#10b981", desc: "Manchester City: W5, D1 in last 6" },
  { label: "Home/Away Strength", score: 74, color: "#3b82f6", desc: "Home win rate: 68% this season" },
  { label: "Player Availability", score: 65, color: "#f59e0b", desc: "1 key midfielder questionable" },
  { label: "Fixture Congestion", score: 71, color: "#3b82f6", desc: "Low congestion — 5 days rest" },
  { label: "Weather Impact", score: 90, color: "#10b981", desc: "Clear conditions, 14°C — neutral" },
  { label: "Historical Matchup", score: 58, color: "#f59e0b", desc: "H2H: City 4W, Chelsea 3W, 3D (last 10)" },
];

export function MatchDetail({ onNavigate }: Props) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>

      {/* Match Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,19,39,0.9))",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 20, padding: "32px",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
          Premier League · Matchday 36
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          {/* Home team */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", border: "2px solid rgba(59,130,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>
              MCI
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24 }}>Manchester City</h2>
            <div style={{ fontSize: 12, color: "#6b7fa3", marginTop: 4 }}>Home</div>
          </div>

          {/* Center */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, color: "#3b82f6", letterSpacing: "0.05em" }}>VS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 8 }}>
              <Clock size={12} color="#6b7fa3" />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#f0f4ff" }}>Today 19:45</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7fa3" }}>
                <MapPin size={11} /> Etihad Stadium
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7fa3" }}>
                <Cloud size={11} /> 14°C Clear
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#f59e0b" }}>
              <UserX size={11} /> 1 injury concern (home)
            </div>
          </div>

          {/* Away team */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #2d2d5c)", border: "2px solid rgba(107,127,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: "#a8b8d8" }}>
              CHE
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24 }}>Chelsea</h2>
            <div style={{ fontSize: 12, color: "#6b7fa3", marginTop: 4 }}>Away</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Prediction Summary */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Prediction Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[{ label: "Home Win", value: "58%", color: "#3b82f6", active: true }, { label: "Draw", value: "24%", color: "#f59e0b" }, { label: "Away Win", value: "18%", color: "#6b7fa3" }].map(({ label, value, color, active }) => (
                <div key={label} style={{ background: active ? `${color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 28, color, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#6b7fa3" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, color: "#6b7fa3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Confidence</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>High</div>
              </div>
              <div style={{ flex: 1, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, color: "#6b7fa3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Risk Level</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>Medium</div>
              </div>
              <div style={{ flex: 1, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, color: "#6b7fa3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Model Ver.</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#3b82f6" }}>v3.4.1</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "#6b7fa3", display: "flex", alignItems: "center", gap: 4 }}>
              <Info size={11} /> Last updated: Today 06:02 AM · Data locked at kickoff
            </div>
          </div>

          {/* Probability chart */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Probability Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={PROB_DATA} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#a8b8d8", fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Model probability"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {PROB_DATA.map((entry, i) => <Cell key={`prob-cell-${i}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key factors */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Key Influencing Factors</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FACTORS.map(({ label, score, color, desc }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f4ff" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#6b7fa3" }}>{desc}</div>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color }}>{score}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Explanation */}
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(13,19,39,0.9))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Info size={16} color="#3b82f6" />
              </div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18 }}>AI Match Intelligence</h3>
            </div>
            <p style={{ color: "#a8b8d8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              The model indicates a higher likelihood for Manchester City based on their superior recent form (5 wins in last 6), strong home advantage (68% home win rate this season), and Chelsea's inconsistent away performances (38% away win rate). Attacking efficiency metrics further reinforce this signal.
            </p>
            <p style={{ color: "#a8b8d8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Over 2.5 goals probability is elevated at 64% due to both sides' high attacking output. Both Teams to Score sits at 52% — moderate confidence given Chelsea's recent defensive improvements.
            </p>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10 }}>
              <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: "#a8b8d8", fontSize: 12, lineHeight: 1.6 }}>
                <strong style={{ color: "#f59e0b" }}>Responsible Disclaimer:</strong> This is not a guaranteed outcome. This model probability estimate is based on historical data and current form. Past model performance does not guarantee future results. For informational purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Premium report */}
          <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(13,19,39,0.9))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Elite Report</div>
            <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Full Match Intelligence Report</h4>
            {["Tactical summary", "Risk notes & mitigation", "Confidence explanation", "Historical model accuracy for similar fixtures"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 13, color: "#a8b8d8" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} /> {item}
              </div>
            ))}
            <button
              onClick={() => onNavigate("reports")}
              style={{ width: "100%", marginTop: 8, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              View Full Report
            </button>
          </div>

          {/* Actions */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
            <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Quick Actions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => onNavigate("watchlist")}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
              >
                <Star size={16} /> Save to Watchlist
              </button>
              <button
                onClick={() => onNavigate("telegram")}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
              >
                <Send size={16} /> Send Telegram Alert
              </button>
              <button
                onClick={() => onNavigate("reports")}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", borderBottom: 10, borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
              >
                <FileText size={16} /> View Full Report
              </button>
            </div>
          </div>

          {/* Historical accuracy */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
            <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Historical Model Accuracy</h4>
            <p style={{ color: "#6b7fa3", fontSize: 12, marginBottom: 16 }}>For similar Premier League fixtures with High confidence + Medium risk profile:</p>
            {[{ label: "Home win predicted → Correct", value: "71.4%", color: "#10b981" }, { label: "Over 2.5 accuracy", value: "66.2%", color: "#3b82f6" }, { label: "BTTS accuracy", value: "58.9%", color: "#8b5cf6" }].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(59,130,246,0.08)" }}>
                <span style={{ fontSize: 12, color: "#a8b8d8" }}>{label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color }}>{value}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: "#6b7fa3", marginTop: 12 }}>Based on 84 similar matches in model history. Past accuracy does not guarantee future results.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
