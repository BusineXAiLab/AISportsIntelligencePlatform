import { useState, useEffect } from "react";
import { Activity, Clock, TrendingUp, TrendingDown, Minus, Zap, RefreshCw, AlertCircle } from "lucide-react";

type MatchStatus = "pre" | "live" | "ht" | "ft";

interface LiveMatch {
  id: number;
  league: string;
  home: string;
  away: string;
  hCode: string;
  aCode: string;
  minute: number;
  score: [number, number];
  status: MatchStatus;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  prevHomeProb: number;
  prevDrawProb: number;
  prevAwayProb: number;
  events: { minute: number; type: string; team: "home" | "away"; desc: string }[];
  xg: [number, number];
  shots: [number, number];
  possession: [number, number];
  modelAlert?: string;
}

const INITIAL_MATCHES: LiveMatch[] = [
  {
    id: 1, league: "Premier League", home: "Manchester City", away: "Chelsea", hCode: "MCI", aCode: "CHE",
    minute: 34, score: [1, 0], status: "live",
    homeProb: 68, drawProb: 20, awayProb: 12,
    prevHomeProb: 58, prevDrawProb: 24, prevAwayProb: 18,
    events: [{ minute: 22, type: "goal", team: "home", desc: "Haaland — header from cross" }],
    xg: [1.42, 0.31], shots: [8, 4], possession: [62, 38],
    modelAlert: "Home advantage strengthened. Goal probability: 78% for 2+ goals.",
  },
  {
    id: 2, league: "La Liga", home: "Real Madrid", away: "Barcelona", hCode: "RMA", aCode: "BAR",
    minute: 0, score: [0, 0], status: "pre",
    homeProb: 45, drawProb: 28, awayProb: 27,
    prevHomeProb: 45, prevDrawProb: 28, prevAwayProb: 27,
    events: [],
    xg: [0, 0], shots: [0, 0], possession: [50, 50],
  },
  {
    id: 3, league: "Bundesliga", home: "Bayern Munich", away: "Dortmund", hCode: "BAY", aCode: "BVB",
    minute: 45, score: [2, 1], status: "ht",
    homeProb: 71, drawProb: 16, awayProb: 13,
    prevHomeProb: 62, prevDrawProb: 20, prevAwayProb: 18,
    events: [{ minute: 12, type: "goal", team: "home", desc: "Kane — penalty" }, { minute: 38, type: "goal", team: "away", desc: "Adeyemi — counter-attack" }, { minute: 44, type: "goal", team: "home", desc: "Müller — tap-in" }],
    xg: [2.10, 0.88], shots: [12, 5], possession: [58, 42],
    modelAlert: "HT model update: Bayern xG dominance suggests continued home pressure.",
  },
  {
    id: 4, league: "Serie A", home: "Inter Milan", away: "AC Milan", hCode: "INT", aCode: "MIL",
    minute: 67, score: [1, 1], status: "live",
    homeProb: 38, drawProb: 34, awayProb: 28,
    prevHomeProb: 51, prevDrawProb: 26, prevAwayProb: 23,
    events: [{ minute: 31, type: "goal", team: "home", desc: "Lautaro — first-time finish" }, { minute: 55, type: "red", team: "home", desc: "Barella — second yellow" }, { minute: 59, type: "goal", team: "away", desc: "Leão — long range" }],
    xg: [1.64, 1.21], shots: [9, 8], possession: [49, 51],
    modelAlert: "⚠️ Red card event recalibrated. Draw probability elevated significantly.",
  },
];

function probDelta(current: number, prev: number) {
  const diff = current - prev;
  if (Math.abs(diff) < 1) return null;
  return diff;
}

function ProbShift({ current, prev, color }: { current: number; prev: number; color: string }) {
  const delta = probDelta(current, prev);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color }}>{current}%</div>
      {delta !== null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 10, color: delta > 0 ? "#10b981" : "#ef4444", marginTop: 2 }}>
          {delta > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {delta > 0 ? "+" : ""}{delta.toFixed(0)}pp
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<MatchStatus, { label: string; color: string; bg: string }> = {
  pre:  { label: "Pre-Match", color: "#6b7fa3", bg: "rgba(107,127,163,0.12)" },
  live: { label: "LIVE", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  ht:   { label: "Half Time", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ft:   { label: "Full Time", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

export function LiveFeed() {
  const [matches, setMatches] = useState<LiveMatch[]>(INITIAL_MATCHES);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<LiveMatch | null>(null);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => {
        if (m.status !== "live") return m;
        const newMinute = Math.min(m.minute + 1, 90);
        // Slight probability drift
        const drift = (Math.random() - 0.5) * 1.5;
        return {
          ...m,
          minute: newMinute,
          prevHomeProb: m.homeProb,
          prevDrawProb: m.drawProb,
          prevAwayProb: m.awayProb,
          homeProb: Math.max(5, Math.min(90, m.homeProb + drift)),
          drawProb: Math.max(5, Math.min(60, m.drawProb - drift * 0.5)),
          awayProb: Math.max(5, Math.min(85, m.awayProb)),
        };
      }));
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter(m => m.status === "live");
  const otherMatches = matches.filter(m => m.status !== "live");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444", animation: "pulse 1.5s infinite" }} />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Live Match Intelligence</h1>
          </div>
          <p style={{ color: "#6b7fa3", fontSize: 15 }}>Real-time model recalibration as matches progress — probabilities update every 60 seconds</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7fa3", fontSize: 12 }}>
          <RefreshCw size={13} style={{ animation: "spin 3s linear infinite" }} />
          Auto-refreshing · Tick #{tick}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Model alerts */}
      {matches.filter(m => m.modelAlert).map(m => (
        <div key={m.id} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Zap size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em" }}>Model Alert · {m.match || `${m.home} vs ${m.away}`} </span>
            <span style={{ fontSize: 13, color: "#a8b8d8", marginLeft: 8 }}>{m.modelAlert}</span>
          </div>
        </div>
      ))}

      {/* Live matches */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} /> {liveMatches.length} Live Now
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
          {liveMatches.map(m => <MatchCard key={m.id} match={m} onClick={() => setSelected(m)} />)}
        </div>
      </div>

      {/* Other matches */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Other Matches Today</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
          {otherMatches.map(m => <MatchCard key={m.id} match={m} onClick={() => setSelected(m)} />)}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
          <div style={{ width: "min(500px, 100%)", background: "#0d1327", borderLeft: "1px solid rgba(59,130,246,0.2)", padding: "32px 28px", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={{ fontSize: 13, color: "#6b7fa3", background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}>← Close</button>
            <div style={{ fontSize: 10, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{selected.league}</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 20 }}>{selected.home} vs {selected.away}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[["xG Home", selected.xg[0].toFixed(2), "#3b82f6"], ["xG Away", selected.xg[1].toFixed(2), "#6b7fa3"], ["Possession", `${selected.possession[0]}%`, "#10b981"]].map(([l, v, c]) => (
                <div key={l as string} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#6b7fa3", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: c as string }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7fa3", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Match Events</div>
              {selected.events.length === 0 ? (
                <div style={{ color: "#6b7fa3", fontSize: 13 }}>No events yet</div>
              ) : (
                selected.events.map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(59,130,246,0.06)", alignItems: "center" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3b82f6", width: 28, flexShrink: 0 }}>{ev.minute}'</span>
                    <span style={{ fontSize: 12, color: ev.type === "goal" ? "#10b981" : ev.type === "red" ? "#ef4444" : "#f59e0b", fontWeight: 700 }}>{ev.type === "goal" ? "⚽" : ev.type === "red" ? "🟥" : "🟨"}</span>
                    <span style={{ fontSize: 13, color: "#a8b8d8" }}>{ev.desc}</span>
                    <span style={{ fontSize: 11, color: "#6b7fa3", marginLeft: "auto" }}>{ev.team === "home" ? selected.hCode : selected.aCode}</span>
                  </div>
                ))
              )}
            </div>

            {selected.modelAlert && (
              <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Model Intelligence Update</div>
                <p style={{ color: "#a8b8d8", fontSize: 13, lineHeight: 1.6 }}>{selected.modelAlert}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match: m, onClick }: { match: LiveMatch; onClick: () => void }) {
  const st = STATUS_LABELS[m.status];
  return (
    <div
      onClick={onClick}
      style={{
        background: m.status === "live" ? "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(13,19,39,0.95))" : "#0d1327",
        border: `1px solid ${m.status === "live" ? "rgba(239,68,68,0.25)" : m.status === "ht" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.12)"}`,
        borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = m.status === "live" ? "rgba(239,68,68,0.25)" : m.status === "ht" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.12)")}
    >
      {/* Header */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.league}</span>
        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}40`, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
          {m.status === "live" ? `${m.minute}'` : st.label}
        </span>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Score + teams */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: 600 }}>{m.home}</div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "6px 14px", fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: "#f0f4ff", whiteSpace: "nowrap" }}>
            {m.score[0]} – {m.score[1]}
          </div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{m.away}</div>
        </div>

        {/* Live probability shifts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Home Win", current: m.homeProb, prev: m.prevHomeProb, color: "#3b82f6" },
            { label: "Draw", current: m.drawProb, prev: m.prevDrawProb, color: "#f59e0b" },
            { label: "Away Win", current: m.awayProb, prev: m.prevAwayProb, color: "#6b7fa3" },
          ].map(p => (
            <div key={p.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 4px", textAlign: "center" }}>
              <ProbShift current={Math.round(p.current)} prev={Math.round(p.prev)} color={p.color} />
              <div style={{ fontSize: 9, color: "#6b7fa3", textTransform: "uppercase", marginTop: 2 }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* xG bar */}
        {m.status !== "pre" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7fa3", marginBottom: 4 }}>
              <span>xG {m.xg[0].toFixed(2)}</span><span>xG {m.xg[1].toFixed(2)}</span>
            </div>
            <div style={{ height: 4, display: "flex", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ flex: m.xg[0], background: "#3b82f6" }} />
              <div style={{ flex: m.xg[1], background: "#6b7fa3" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
