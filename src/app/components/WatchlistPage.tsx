import { Star, Bell, BellOff, Send, ChevronRight, X, Plus } from "lucide-react";

type Page = "landing" | "pricing" | "login" | "register" | "dashboard" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";
interface Props { onNavigate: (page: Page) => void; }

const SAVED_MATCHES = [
  { match: "Manchester City vs Chelsea", league: "Premier League", kickoff: "Today 19:45", homeProb: 58, confidence: "High", risk: "Medium" },
  { match: "Bayern Munich vs Dortmund", league: "Bundesliga", kickoff: "Today 18:30", homeProb: 62, confidence: "High", risk: "Low" },
  { match: "PSG vs Marseille", league: "Ligue 1", kickoff: "Today 21:00", homeProb: 67, confidence: "High", risk: "Low" },
];

const FAV_TEAMS = [
  { name: "Manchester City", league: "Premier League", form: ["W", "W", "D", "W", "W"], nextMatch: "vs Chelsea · Today" },
  { name: "Bayern Munich", league: "Bundesliga", form: ["W", "W", "W", "D", "W"], nextMatch: "vs Dortmund · Today" },
  { name: "Real Madrid", league: "La Liga", form: ["W", "L", "W", "W", "D"], nextMatch: "vs Barcelona · Today" },
  { name: "Inter Milan", league: "Serie A", form: ["D", "W", "W", "W", "W"], nextMatch: "vs AC Milan · Today" },
];

const ALERTS = [
  { label: "Pre-match alerts (4h before)", enabled: true },
  { label: "High confidence signals", enabled: true },
  { label: "Watchlist team news", enabled: false },
  { label: "Daily intelligence brief", enabled: true },
  { label: "Elite report publications", enabled: false },
];

export function WatchlistPage({ onNavigate }: Props) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, marginBottom: 4 }}>Watchlist</h1>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Your personalized intelligence feed — favorite teams, leagues, and saved matches</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Saved matches */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22 }}>Saved Matches</h2>
              <span style={{ fontSize: 12, color: "#6b7fa3" }}>{SAVED_MATCHES.length} saved</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SAVED_MATCHES.map((m, i) => (
                <div
                  key={i}
                  style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.league} · {m.kickoff}</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{m.match}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#3b82f6", fontWeight: 500 }}>{m.homeProb}%</span>
                    <ConfBadge level={m.confidence} />
                    <RiskBadge level={m.risk} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onNavigate("match-detail")} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      View <ChevronRight size={12} />
                    </button>
                    <button style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", borderRadius: 8, padding: "7px", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite teams */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22 }}>Favorite Teams</h2>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Add Team
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {FAV_TEAMS.map((team, i) => (
                <div key={i} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #131d3a, #1e2d54)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, color: "#a8b8d8" }}>
                      {team.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{team.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7fa3" }}>{team.league}</div>
                    </div>
                    <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
                      <Star size={16} color="#f59e0b" fill="#f59e0b" />
                    </button>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 6 }}>Recent Form</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {team.form.map((f, j) => (
                        <span key={j} style={{ width: 24, height: 24, borderRadius: 6, background: f === "W" ? "rgba(16,185,129,0.15)" : f === "D" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: f === "W" ? "#10b981" : f === "D" ? "#f59e0b" : "#ef4444", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#a8b8d8", background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: "8px 12px" }}>
                    Next: {team.nextMatch}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended matches */}
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Recommended Matches</h2>
            <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(13,19,39,0.9))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, padding: 20 }}>
              <p style={{ color: "#6b7fa3", fontSize: 13, marginBottom: 16 }}>Based on your favorite teams and watchlist activity:</p>
              {["Arsenal vs Tottenham · PL · High Confidence", "Juventus vs Napoli · SA · Medium Confidence", "Atletico vs Sevilla · LL · High Confidence"].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(59,130,246,0.08)" : "none" }}>
                  <span style={{ fontSize: 13, color: "#a8b8d8" }}>{r}</span>
                  <button onClick={() => onNavigate("match-detail")} style={{ color: "#3b82f6", fontSize: 12, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
                    View <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Alert preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Bell size={18} color="#3b82f6" />
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Notification Preferences</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ALERTS.map((alert, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#a8b8d8" }}>{alert.label}</span>
                  <div
                    style={{
                      width: 44, height: 24, borderRadius: 100,
                      background: alert.enabled ? "#3b82f6" : "#1e2d54",
                      border: `1px solid ${alert.enabled ? "#3b82f6" : "rgba(59,130,246,0.2)"}`,
                      position: "relative", cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: alert.enabled ? 22 : 2, transition: "left 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telegram alert prefs */}
          <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(13,19,39,0.9))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Send size={18} color="#10b981" />
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Telegram Alerts</h3>
            </div>
            <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginBottom: 12 }}>● VIP Channel Connected</div>
            {["Send watchlist team alerts", "High confidence match alerts", "Daily brief summary"].map((pref, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#a8b8d8" }}>{pref}</span>
                <div style={{ width: 44, height: 24, borderRadius: 100, background: "#10b981", border: "1px solid #10b981", position: "relative", cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 22 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Favorite leagues */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Favorite Leagues</h3>
              <button style={{ color: "#3b82f6", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>+ Add</button>
            </div>
            {["Premier League", "Bundesliga", "La Liga"].map((lg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(59,130,246,0.08)" : "none" }}>
                <span style={{ fontSize: 13, color: "#a8b8d8" }}>{lg}</span>
                <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={14} color="#6b7fa3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfBadge({ level }: { level: string }) {
  const c: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  return <span style={{ background: `${c[level]}18`, color: c[level], border: `1px solid ${c[level]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{level} Conf.</span>;
}

function RiskBadge({ level }: { level: string }) {
  const c: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };
  return <span style={{ background: `${c[level]}12`, color: c[level], border: `1px solid ${c[level]}30`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{level} Risk</span>;
}
