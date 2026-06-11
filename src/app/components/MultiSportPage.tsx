import { useState } from "react";
import { Zap, Lock, ChevronRight, TrendingUp } from "lucide-react";

type Sport = "football" | "nfl" | "nba" | "tennis" | "cricket";

const SPORTS: { id: Sport; label: string; icon: string; live: boolean; matches: number; premium?: boolean }[] = [
  { id: "football", label: "Football / Soccer", icon: "⚽", live: true, matches: 14 },
  { id: "nfl", label: "NFL", icon: "🏈", live: false, matches: 8, premium: true },
  { id: "nba", label: "NBA", icon: "🏀", live: true, matches: 6, premium: true },
  { id: "tennis", label: "Tennis", icon: "🎾", live: true, matches: 24, premium: true },
  { id: "cricket", label: "Cricket", icon: "🏏", live: false, matches: 4, premium: true },
];

const FOOTBALL_MATCHES = [
  { league: "Premier League", home: "Manchester City", away: "Chelsea", kickoff: "19:45", homeProb: 58, drawProb: 24, awayProb: 18, confidence: "High", risk: "Medium" },
  { league: "La Liga", home: "Real Madrid", away: "Barcelona", kickoff: "20:00", homeProb: 45, drawProb: 28, awayProb: 27, confidence: "Medium", risk: "High" },
  { league: "Bundesliga", home: "Bayern Munich", away: "Dortmund", kickoff: "18:30", homeProb: 62, drawProb: 20, awayProb: 18, confidence: "High", risk: "Low" },
];

const NBA_MATCHES = [
  { home: "Boston Celtics", away: "Miami Heat", time: "20:00 ET", homeProb: 64, awayProb: 36, confidence: "High", spread: "-5.5", ou: "218.5 o/u" },
  { home: "LA Lakers", away: "Golden State", time: "22:30 ET", homeProb: 49, awayProb: 51, confidence: "Medium", spread: "+1.5", ou: "224.0 o/u" },
  { home: "Denver Nuggets", away: "Phoenix Suns", time: "21:00 ET", homeProb: 61, awayProb: 39, confidence: "High", spread: "-4.0", ou: "211.5 o/u" },
];

const TENNIS_MATCHES = [
  { tournament: "Roland Garros", player1: "C. Alcaraz", player2: "R. Nadal", round: "QF", p1Prob: 54, p2Prob: 46, confidence: "Medium", surface: "Clay" },
  { tournament: "Roland Garros", player1: "N. Djokovic", player2: "A. Zverev", round: "QF", p1Prob: 68, p2Prob: 32, confidence: "High", surface: "Clay" },
  { tournament: "Roland Garros", player1: "I. Swiatek", player2: "A. Sabalenka", round: "SF", p1Prob: 61, p2Prob: 39, confidence: "High", surface: "Clay" },
];

const NFL_MATCHES = [
  { home: "Kansas City Chiefs", away: "Buffalo Bills", time: "Sun 16:25 ET", homeProb: 56, awayProb: 44, confidence: "Medium", spread: "-3.0", week: "Week 14" },
  { home: "Dallas Cowboys", away: "Philadelphia Eagles", time: "Sun 20:20 ET", homeProb: 42, awayProb: 58, confidence: "High", spread: "+5.5", week: "Week 14" },
];

const CONF_C: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
const RISK_C: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

export function MultiSportPage() {
  const [sport, setSport] = useState<Sport>("football");
  const selectedSport = SPORTS.find(s => s.id === sport)!;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Zap size={22} color="#3b82f6" />
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Multi-Sport Intelligence Hub</h1>
        </div>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>AI model predictions across football, NFL, NBA, tennis, and cricket</p>
      </div>

      {/* Sport selector */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        {SPORTS.map(s => (
          <button
            key={s.id}
            onClick={() => setSport(s.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "16px 24px", borderRadius: 14,
              background: sport === s.id ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.1))" : "#0d1327",
              border: `1px solid ${sport === s.id ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.12)"}`,
              cursor: "pointer", transition: "all 0.2s",
              position: "relative",
            }}
          >
            {s.premium && sport !== s.id && (
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <Lock size={11} color="#6b7fa3" />
              </div>
            )}
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: sport === s.id ? "#f0f4ff" : "#a8b8d8", whiteSpace: "nowrap" }}>{s.label}</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {s.live && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />}
              <span style={{ fontSize: 10, color: "#6b7fa3" }}>{s.matches} today</span>
            </div>
          </button>
        ))}
      </div>

      {/* Sport content */}
      {sport === "football" && (
        <FootballPanel matches={FOOTBALL_MATCHES} />
      )}
      {sport === "nba" && (
        <NBAPanel matches={NBA_MATCHES} />
      )}
      {sport === "tennis" && (
        <TennisPanel matches={TENNIS_MATCHES} />
      )}
      {sport === "nfl" && (
        <NFLPanel matches={NFL_MATCHES} />
      )}
      {sport === "cricket" && (
        <LockedPanel sport="Cricket" icon="🏏" />
      )}
    </div>
  );
}

function FootballPanel({ matches }: { matches: typeof FOOTBALL_MATCHES }) {
  return (
    <div>
      <SectionHeader title="Football / Soccer Predictions" subtitle="Premier League · La Liga · Bundesliga and more" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {matches.map((m, i) => (
          <div key={i} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{m.league}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3b82f6" }}>{m.kickoff}</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{m.home}</span>
              <span style={{ fontSize: 11, color: "#6b7fa3" }}>vs</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{m.away}</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[["H", m.homeProb, "#3b82f6"], ["D", m.drawProb, "#f59e0b"], ["A", m.awayProb, "#6b7fa3"]].map(([l, p, c]) => (
                <div key={l as string} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: c as string }}>{p}%</div>
                  <div style={{ fontSize: 9, color: "#6b7fa3", textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
            <span style={{ background: `${CONF_C[m.confidence]}18`, color: CONF_C[m.confidence], border: `1px solid ${CONF_C[m.confidence]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{m.confidence} Conf.</span>
            <span style={{ background: `${RISK_C[m.risk]}12`, color: RISK_C[m.risk], border: `1px solid ${RISK_C[m.risk]}30`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{m.risk} Risk</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NBAPanel({ matches }: { matches: typeof NBA_MATCHES }) {
  return (
    <div>
      <SectionHeader title="NBA Predictions" subtitle="Eastern & Western Conference · Win probability + O/U signals" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {matches.map((m, i) => (
          <div key={i} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>🏀 {m.time}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.home}</div>
                <div style={{ fontSize: 11, color: "#6b7fa3" }}>Home</div>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, color: "#3b82f6" }}>VS</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.away}</div>
                <div style={{ fontSize: 11, color: "#6b7fa3" }}>Away</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[["Home Win", m.homeProb, "#3b82f6"], ["Away Win", m.awayProb, "#6b7fa3"]].map(([l, p, c]) => (
                <div key={l as string} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: c as string }}>{p}%</div>
                  <div style={{ fontSize: 10, color: "#6b7fa3" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ flex: 1, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 12, color: "#a8b8d8", fontFamily: "'DM Mono', monospace" }}>Spread: {m.spread}</span>
              <span style={{ flex: 1, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 12, color: "#a8b8d8", fontFamily: "'DM Mono', monospace" }}>{m.ou}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TennisPanel({ matches }: { matches: typeof TENNIS_MATCHES }) {
  return (
    <div>
      <SectionHeader title="Tennis Predictions" subtitle="Grand Slams · ATP · WTA · Surface-adjusted model signals" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {matches.map((m, i) => (
          <div key={i} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>🎾 {m.tournament}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#f59e0b" }}>{m.round} · {m.surface}</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.player1}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#3b82f6" }}>{m.p1Prob}%</div>
              </div>
              <span style={{ color: "#6b7fa3", fontSize: 12 }}>vs</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.player2}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#6b7fa3" }}>{m.p2Prob}%</div>
              </div>
            </div>
            {/* Win probability bar */}
            <div style={{ width: 160, flexShrink: 0 }}>
              <div style={{ height: 6, display: "flex", borderRadius: 100, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ flex: m.p1Prob, background: "#3b82f6" }} />
                <div style={{ flex: m.p2Prob, background: "#6b7fa3" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7fa3" }}>
                <span>{m.player1.split(" ")[1]}</span><span>{m.player2.split(" ")[1]}</span>
              </div>
            </div>
            <span style={{ background: `${CONF_C[m.confidence]}18`, color: CONF_C[m.confidence], border: `1px solid ${CONF_C[m.confidence]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{m.confidence}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NFLPanel({ matches }: { matches: typeof NFL_MATCHES }) {
  return (
    <div>
      <SectionHeader title="NFL Predictions" subtitle="Win probability · Spread analysis · Season week" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {matches.map((m, i) => (
          <div key={i} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "22px" }}>
            <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 12 }}>🏈 {m.week} · {m.time}</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.home}</div>
                  <div style={{ fontSize: 11, color: "#6b7fa3" }}>Home</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.away}</div>
                  <div style={{ fontSize: 11, color: "#6b7fa3" }}>Away</div>
                </div>
              </div>
              <div style={{ height: 8, display: "flex", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ flex: m.homeProb, background: "#3b82f6" }} />
                <div style={{ flex: m.awayProb, background: "#6b7fa3" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                <span style={{ color: "#3b82f6" }}>{m.homeProb}%</span>
                <span style={{ color: "#6b7fa3" }}>{m.awayProb}%</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ flex: 1, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 12, color: "#a8b8d8", fontFamily: "'DM Mono', monospace" }}>Spread: {m.spread}</span>
              <span style={{ flex: 1, background: `${CONF_C[m.confidence]}12`, border: `1px solid ${CONF_C[m.confidence]}30`, color: CONF_C[m.confidence], borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 12, fontWeight: 700 }}>{m.confidence} Conf.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LockedPanel({ sport, icon }: { sport: string; icon: string }) {
  return (
    <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "64px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 8 }}>{sport} — Coming Soon</h3>
      <p style={{ color: "#6b7fa3", maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>Our {sport} model is currently in development. Subscribe for early access and be notified when it launches.</p>
      <button style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>Notify Me on Launch</button>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 4 }}>{title}</h2>
      <p style={{ color: "#6b7fa3", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}
