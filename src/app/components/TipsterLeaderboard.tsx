import { useState } from "react";
import { Trophy, TrendingUp, Star, Users, ChevronRight, Medal, Shield, BarChart2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const TIPSTERS = [
  { rank: 1, name: "DataKing_88", avatar: "DK", accuracy: 74.2, predictions: 312, followers: 2840, profit: "+$4,210", streak: 8, trend: [68,70,71,73,72,74,74], badge: "Elite Verified", sport: "Football", winRate: "W18 D3 L5" },
  { rank: 2, name: "QuantumForm", avatar: "QF", accuracy: 72.8, predictions: 284, followers: 1920, profit: "+$3,180", streak: 5, trend: [65,68,70,71,72,72,73], badge: "Premium", sport: "Football", winRate: "W15 D4 L7" },
  { rank: 3, name: "xGMaster", avatar: "XG", accuracy: 71.5, predictions: 198, followers: 1540, profit: "+$2,760", streak: 12, trend: [66,67,69,70,71,71,72], badge: "Rising Star", sport: "Football", winRate: "W14 D3 L6" },
  { rank: 4, name: "TacticsAI", avatar: "TA", accuracy: 70.3, predictions: 256, followers: 1280, profit: "+$2,100", streak: 3, trend: [64,66,68,69,70,70,70], badge: "Verified", sport: "Multi-Sport", winRate: "W13 D5 L8" },
  { rank: 5, name: "FormCrusher", avatar: "FC", accuracy: 69.8, predictions: 188, followers: 980, profit: "+$1,840", streak: 6, trend: [62,64,66,68,69,69,70], badge: "Premium", sport: "Football", winRate: "W12 D4 L7" },
  { rank: 6, name: "StatWizard", avatar: "SW", accuracy: 68.5, predictions: 220, followers: 876, profit: "+$1,540", streak: 2, trend: [60,62,65,67,68,68,69], badge: "Verified", sport: "Football", winRate: "W11 D6 L7" },
  { rank: 7, name: "ProbEdge_7", avatar: "PE", accuracy: 67.9, predictions: 164, followers: 720, profit: "+$1,240", streak: 4, trend: [58,61,64,66,67,68,68], badge: "Premium", sport: "Tennis", winRate: "W10 D5 L8" },
  { rank: 8, name: "ModelBot_X", avatar: "MB", accuracy: 66.4, predictions: 298, followers: 645, profit: "+$980", streak: 1, trend: [60,62,63,65,66,66,66], badge: "Verified", sport: "Football", winRate: "W10 D4 L9" },
];

const BADGES: Record<string, { color: string; bg: string; icon: typeof Shield }> = {
  "Elite Verified": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Trophy },
  "Rising Star":   { color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: TrendingUp },
  "Premium":       { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: Star },
  "Verified":      { color: "#a8b8d8", bg: "rgba(168,184,216,0.08)", icon: Shield },
};

const FILTERS = ["All Sports", "Football", "Tennis", "Multi-Sport"];
const PERIODS = ["This Week", "This Month", "All Time"];

export function TipsterLeaderboard() {
  const [filter, setFilter] = useState("All Sports");
  const [period, setPeriod] = useState("This Month");
  const [selected, setSelected] = useState<typeof TIPSTERS[0] | null>(null);

  const filtered = TIPSTERS.filter(t => filter === "All Sports" || t.sport === filter || (filter === "Multi-Sport" && t.sport === "Multi-Sport"));

  if (selected) {
    return <TipsterProfile tipster={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Trophy size={22} color="#f59e0b" />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Tipster Leaderboard</h1>
          </div>
          <p style={{ color: "#6b7fa3", fontSize: 15 }}>Publicly verified accuracy records — transparency by design</p>
        </div>
        <button
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
        >
          Become a Tipster →
        </button>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32, maxWidth: 700 }}>
        {[TIPSTERS[1], TIPSTERS[0], TIPSTERS[2]].map((t, i) => {
          const podiumRank = [2, 1, 3][i];
          const heights = ["160px", "200px", "140px"];
          const medalColors = ["#a8b8d8", "#f59e0b", "#cd7c2f"];
          return (
            <div
              key={t.rank}
              onClick={() => setSelected(t)}
              style={{
                background: podiumRank === 1 ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(13,19,39,0.9))" : "#0d1327",
                border: `1px solid ${podiumRank === 1 ? "rgba(245,158,11,0.4)" : "rgba(59,130,246,0.15)"}`,
                borderRadius: 16, padding: "20px 16px", textAlign: "center",
                cursor: "pointer", alignSelf: "flex-end",
                height: heights[i], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: podiumRank === 1 ? "0 0 40px rgba(245,158,11,0.1)" : "none",
              }}
            >
              <Medal size={20} color={medalColors[i]} />
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, #131d3a, #1e2d54)`, border: `2px solid ${medalColors[i]}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13, color: "#f0f4ff" }}>{t.avatar}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: medalColors[i] }}>{t.accuracy}%</div>
              <div style={{ fontSize: 11, color: "#6b7fa3" }}>#{podiumRank}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: filter === f ? "#3b82f6" : "rgba(59,130,246,0.08)", border: `1px solid ${filter === f ? "#3b82f6" : "rgba(59,130,246,0.2)"}`, color: filter === f ? "#fff" : "#a8b8d8", cursor: "pointer" }}>{f}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: period === p ? "rgba(59,130,246,0.15)" : "transparent", border: `1px solid ${period === p ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.12)"}`, color: period === p ? "#3b82f6" : "#6b7fa3", cursor: "pointer" }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(59,130,246,0.06)" }}>
              {["Rank", "Tipster", "Accuracy", "7-Day Trend", "Predictions", "Followers", "Streak", "Badge", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const badge = BADGES[t.badge];
              const BadgeIcon = badge.icon;
              return (
                <tr
                  key={t.rank}
                  style={{ borderBottom: "1px solid rgba(59,130,246,0.06)", cursor: "pointer", transition: "background 0.15s" }}
                  onClick={() => setSelected(t)}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: t.rank <= 3 ? "#f59e0b" : "#6b7fa3" }}>#{t.rank}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #131d3a, #1e2d54)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, color: "#a8b8d8" }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7fa3" }}>{t.sport} · {t.winRate}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, color: t.accuracy >= 72 ? "#10b981" : t.accuracy >= 69 ? "#f59e0b" : "#a8b8d8" }}>{t.accuracy}%</span>
                  </td>
                  <td style={{ padding: "14px 16px", width: 100 }}>
                    <ResponsiveContainer width={90} height={36}>
                      <LineChart data={t.trend.map((v, i) => ({ i, v }))}>
                        <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </td>
                  <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#a8b8d8" }}>{t.predictions}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#a8b8d8" }}><Users size={13} /> {t.followers.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>
                      🔥 {t.streak}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: badge.bg, color: badge.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, width: "fit-content" }}>
                      <BadgeIcon size={11} /> {t.badge}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <ChevronRight size={16} color="#6b7fa3" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revenue share CTA */}
      <div style={{ marginTop: 28, background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(16,185,129,0.06))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 16, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Earn Revenue Share as a Verified Tipster</h3>
          <p style={{ color: "#a8b8d8", fontSize: 14 }}>Top tipsters earn 25–40% recurring revenue share from followers who subscribe via their profile. Minimum 50 verified predictions to qualify.</p>
        </div>
        <button style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
          Apply Now
        </button>
      </div>
    </div>
  );
}

function TipsterProfile({ tipster, onBack }: { tipster: typeof TIPSTERS[0]; onBack: () => void }) {
  const monthlyTrend = [
    { month: "Jan", acc: 68 }, { month: "Feb", acc: 70 }, { month: "Mar", acc: 69 },
    { month: "Apr", acc: 72 }, { month: "May", acc: 73 }, { month: "Jun", acc: tipster.accuracy },
  ];
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <button onClick={onBack} style={{ color: "#6b7fa3", fontSize: 14, background: "none", border: "none", cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Leaderboard
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div>
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: 32, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #131d3a, #1e2d54)", border: "2px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#f0f4ff" }}>{tipster.avatar}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{tipster.name}</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: "#6b7fa3" }}>Rank #{tipster.rank} · {tipster.sport}</span>
                  <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>🔥 {tipster.streak} streak</span>
                </div>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[["Accuracy", `${tipster.accuracy}%`, "#10b981"], ["Predictions", tipster.predictions.toString(), "#3b82f6"], ["Followers", tipster.followers.toLocaleString(), "#f59e0b"], ["Est. Profit", tipster.profit, "#10b981"]].map(([l, v, c]) => (
                    <div key={l as string}>
                      <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 20, color: c as string }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>6-Month Accuracy Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyTrend}>
                <Tooltip contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="acc" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>Follow Tipster</button>
          <button style={{ width: "100%", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Subscribe for Alerts — $4.99/mo</button>
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: 20 }}>
            <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Recent Picks</h4>
            {[["Man City Win", "Correct ✓", "#10b981"], ["Over 2.5 Goals", "Correct ✓", "#10b981"], ["Barcelona Win", "Incorrect ✗", "#ef4444"], ["Bayern Win", "Correct ✓", "#10b981"]].map(([pick, res, c], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(59,130,246,0.06)" : "none", fontSize: 13 }}>
                <span style={{ color: "#a8b8d8" }}>{pick}</span>
                <span style={{ color: c as string, fontWeight: 600 }}>{res}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
