import { RefreshCw, TrendingUp, Activity, Zap, ChevronRight, Star, Send, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type Page = "landing" | "pricing" | "login" | "register" | "dashboard" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";

interface Props { onNavigate: (page: Page) => void; }

const MATCHES = [
  { league: "Premier League", home: "Manchester City", away: "Chelsea", hCode: "MCI", aCode: "CHE", kickoff: "19:45", homeProb: 58, drawProb: 24, awayProb: 18, confidence: "High", risk: "Medium" },
  { league: "La Liga", home: "Real Madrid", away: "Barcelona", hCode: "RMA", aCode: "BAR", kickoff: "20:00", homeProb: 45, drawProb: 28, awayProb: 27, confidence: "Medium", risk: "High" },
  { league: "Bundesliga", home: "Bayern Munich", away: "Dortmund", hCode: "BAY", aCode: "BVB", kickoff: "18:30", homeProb: 62, drawProb: 20, awayProb: 18, confidence: "High", risk: "Low" },
  { league: "Serie A", home: "Inter Milan", away: "AC Milan", hCode: "INT", aCode: "MIL", kickoff: "20:45", homeProb: 51, drawProb: 26, awayProb: 23, confidence: "High", risk: "Medium" },
  { league: "Ligue 1", home: "PSG", away: "Marseille", hCode: "PSG", aCode: "MAR", kickoff: "21:00", homeProb: 67, drawProb: 18, awayProb: 15, confidence: "High", risk: "Low" },
];

const ACCURACY_DATA = [
  { day: "Mon", accuracy: 64 }, { day: "Tue", accuracy: 71 }, { day: "Wed", accuracy: 68 },
  { day: "Thu", accuracy: 74 }, { day: "Fri", accuracy: 69 }, { day: "Sat", accuracy: 72 },
  { day: "Sun", accuracy: 76 },
];

const REPORTS = [
  { title: "Daily Intelligence Brief", league: "All Leagues", time: "06:00 AM", tag: "High Confidence", summary: "14 matches analyzed. 6 high-confidence signals identified. Key focus: Premier League and Bundesliga matchday." },
  { title: "La Liga Clasico Preview", league: "La Liga", time: "08:30 AM", tag: "Premium", summary: "Deep tactical analysis of Real Madrid vs Barcelona. Form divergence identified across key metrics." },
  { title: "Champions League Group Stage", league: "UCL", time: "10:00 AM", tag: "Elite", summary: "Group stage predictions for all 8 simultaneous fixtures. Risk distribution analysis included." },
];

function ConfBadge({ level }: { level: string }) {
  const c: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  return (
    <span style={{ background: `${c[level]}18`, color: c[level], border: `1px solid ${c[level]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {level} Conf.
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const c: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };
  return (
    <span style={{ background: `${c[level]}12`, color: c[level], border: `1px solid ${c[level]}30`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {level} Risk
    </span>
  );
}

function Badge({ code }: { code: string }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #131d3a, #1e2d54)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 10, color: "#a8b8d8", letterSpacing: "0.05em", flexShrink: 0 }}>
      {code}
    </div>
  );
}

export function Dashboard({ onNavigate }: Props) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff" }}>

      {/* Main content */}
      <div style={{ padding: "24px" }}>

        {/* Hero summary */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.08) 100%)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 20, padding: "28px 32px", marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                Today's Football Intelligence
              </div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: "-0.01em", marginBottom: 20 }}>
                Thursday, June 11
              </h2>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { label: "Matches Analyzed", value: "14", color: "#3b82f6", icon: Activity },
                  { label: "High-Confidence Signals", value: "6", color: "#10b981", icon: Zap },
                  { label: "Avg. Model Confidence", value: "72.4%", color: "#f59e0b", icon: TrendingUp },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Icon size={14} color={color} />
                      <span style={{ fontSize: 11, color: "#6b7fa3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, color, lineHeight: 1 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7fa3", fontSize: 12 }}>
              <RefreshCw size={12} />
              Last refresh: 06:02 AM · Next: 10:00 AM
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* Left: Matches */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22 }}>Today's Matches</h3>
              <button onClick={() => onNavigate("match-detail")} style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MATCHES.map((match, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0d1327",
                    border: "1px solid rgba(59,130,246,0.12)",
                    borderRadius: 14, padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}
                  onClick={() => onNavigate("match-detail")}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.12)")}
                >
                  <div style={{ flex: "0 0 auto" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7fa3", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>{match.league}</div>
                    <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono', monospace" }}>{match.kickoff}</div>
                  </div>

                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <Badge code={match.hCode} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{match.home}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7fa3", marginX: 8 }}>vs</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{match.away}</div>
                    </div>
                    <Badge code={match.aCode} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["H", match.homeProb], ["D", match.drawProb], ["A", match.awayProb]].map(([label, prob]) => (
                        <div key={label as string} style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color: "#f0f4ff" }}>{prob}%</div>
                          <div style={{ fontSize: 9, color: "#6b7fa3", textTransform: "uppercase" }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <ConfBadge level={match.confidence} />
                    <RiskBadge level={match.risk} />
                    <button
                      style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer" }}
                    >
                      View Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Widgets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Accuracy trend */}
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h4 style={{ fontWeight: 600, fontSize: 14 }}>7-Day Model Accuracy</h4>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: "#10b981" }}>72.1%</span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={ACCURACY_DATA}>
                  <defs>
                    <linearGradient id="dashboard-acc-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "#6b7fa3", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, "Accuracy"]}
                  />
                  <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} fill="url(#dashboard-acc-gradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Risk distribution */}
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Risk Distribution</h4>
              {[{ label: "Low Risk", value: 43, color: "#10b981" }, { label: "Medium Risk", value: 36, color: "#f59e0b" }, { label: "High Risk", value: 21, color: "#ef4444" }].map(({ label, value, color }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#a8b8d8" }}>{label}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color }}>{value}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Telegram status */}
            <div
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,19,39,0.8))", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 16, padding: 20, cursor: "pointer" }}
              onClick={() => onNavigate("telegram")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={18} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Telegram VIP</div>
                  <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>● Connected · VIP Active</div>
                </div>
              </div>
              <p style={{ color: "#6b7fa3", fontSize: 12, lineHeight: 1.5 }}>Next alert scheduled for 15:00. 3 matches in VIP queue.</p>
            </div>

            {/* Latest reports */}
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h4 style={{ fontWeight: 600, fontSize: 14 }}>Latest Reports</h4>
                <button onClick={() => onNavigate("reports")} style={{ color: "#3b82f6", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {REPORTS.map((r, i) => (
                  <div
                    key={i}
                    style={{ cursor: "pointer", paddingBottom: i < REPORTS.length - 1 ? 12 : 0, borderBottom: i < REPORTS.length - 1 ? "1px solid rgba(59,130,246,0.08)" : "none" }}
                    onClick={() => onNavigate("reports")}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{r.title}</span>
                      <span style={{ fontSize: 10, color: "#6b7fa3", whiteSpace: "nowrap", flexShrink: 0 }}>{r.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7fa3", lineHeight: 1.5 }}>{r.summary.slice(0, 80)}...</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Watchlist */}
            <div
              style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20, cursor: "pointer" }}
              onClick={() => onNavigate("watchlist")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Star size={18} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Watchlist</div>
                  <div style={{ fontSize: 12, color: "#6b7fa3" }}>3 saved matches · 4 favorite teams</div>
                </div>
                <ChevronRight size={16} color="#6b7fa3" style={{ marginLeft: "auto" }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
