import { useState } from "react";
import { Plus, X, Zap, Lock, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";

const AVAILABLE_MATCHES = [
  { id: 1, league: "Premier League", match: "Manchester City vs Chelsea", kickoff: "19:45", signals: [{ label: "Home Win", prob: 58, conf: "High", risk: "Medium" }, { label: "Over 2.5 Goals", prob: 64, conf: "High", risk: "Low" }, { label: "BTTS", prob: 52, conf: "Medium", risk: "Medium" }] },
  { id: 2, league: "La Liga", match: "Real Madrid vs Barcelona", kickoff: "20:00", signals: [{ label: "Draw", prob: 28, conf: "Medium", risk: "High" }, { label: "Over 2.5 Goals", prob: 61, conf: "Medium", risk: "Medium" }, { label: "Home Win", prob: 45, conf: "Medium", risk: "High" }] },
  { id: 3, league: "Bundesliga", match: "Bayern Munich vs Dortmund", kickoff: "18:30", signals: [{ label: "Home Win", prob: 62, conf: "High", risk: "Low" }, { label: "Over 3.5 Goals", prob: 48, conf: "Medium", risk: "Medium" }, { label: "BTTS", prob: 58, conf: "High", risk: "Low" }] },
  { id: 4, league: "Serie A", match: "Inter Milan vs AC Milan", kickoff: "20:45", signals: [{ label: "Home Win", prob: 51, conf: "High", risk: "Medium" }, { label: "Under 2.5 Goals", prob: 44, conf: "Medium", risk: "High" }, { label: "Draw", prob: 26, conf: "Medium", risk: "High" }] },
  { id: 5, league: "Ligue 1", match: "PSG vs Marseille", kickoff: "21:00", signals: [{ label: "Home Win", prob: 67, conf: "High", risk: "Low" }, { label: "Over 2.5 Goals", prob: 70, conf: "High", risk: "Low" }, { label: "BTTS", prob: 48, conf: "Medium", risk: "Medium" }] },
];

type SelectedSignal = {
  matchId: number;
  match: string;
  league: string;
  signal: typeof AVAILABLE_MATCHES[0]["signals"][0];
};

function combineProbs(signals: SelectedSignal[]) {
  if (!signals.length) return 0;
  return signals.reduce((acc, s) => acc * (s.signal.prob / 100), 1) * 100;
}

function overallConf(signals: SelectedSignal[]) {
  const levels = signals.map(s => s.signal.conf);
  if (levels.every(l => l === "High")) return "High";
  if (levels.some(l => l === "Low")) return "Low";
  return "Medium";
}

function overallRisk(signals: SelectedSignal[]) {
  const levels = signals.map(s => s.signal.risk);
  if (levels.some(l => l === "High")) return "High";
  if (levels.every(l => l === "Low")) return "Low";
  return "Medium";
}

const CONF_COLOR: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
const RISK_COLOR: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

export function ParlayBuilder() {
  const [selected, setSelected] = useState<SelectedSignal[]>([]);
  const [saved, setSaved] = useState<SelectedSignal[][]>([]);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(1);

  const addSignal = (match: typeof AVAILABLE_MATCHES[0], signal: typeof match["signals"][0]) => {
    if (selected.length >= 5) return;
    const exists = selected.find(s => s.matchId === match.id && s.signal.label === signal.label);
    if (exists) return;
    const alreadyHasMatch = selected.find(s => s.matchId === match.id);
    if (alreadyHasMatch) return;
    setSelected([...selected, { matchId: match.id, match: match.match, league: match.league, signal }]);
  };

  const remove = (matchId: number) => setSelected(selected.filter(s => s.matchId !== matchId));

  const combinedProb = combineProbs(selected);
  const conf = selected.length ? overallConf(selected) : null;
  const risk = selected.length ? overallRisk(selected) : null;

  const save = () => {
    if (selected.length >= 2) { setSaved([...saved, [...selected]]); setSelected([]); }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Zap size={22} color="#3b82f6" />
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Combination Builder</h1>
        </div>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Combine 2–5 model signals into a multi-match insight card. Premium feature.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Left: match picker */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Select Signals — Pick one signal per match (max 5 matches)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {AVAILABLE_MATCHES.map(m => {
              const isExpanded = expandedMatch === m.id;
              const alreadyAdded = selected.find(s => s.matchId === m.id);
              return (
                <div key={m.id} style={{ background: "#0d1327", border: `1px solid ${alreadyAdded ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.12)"}`, borderRadius: 14, overflow: "hidden" }}>
                  <button
                    onClick={() => setExpandedMatch(isExpanded ? null : m.id)}
                    style={{ width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{m.league} · {m.kickoff}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f4ff" }}>{m.match}</div>
                    </div>
                    {alreadyAdded && (
                      <span style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        Added: {alreadyAdded.signal.label}
                      </span>
                    )}
                    <ChevronRight size={16} color="#6b7fa3" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                  </button>

                  {isExpanded && (
                    <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {m.signals.map(sig => {
                        const isAdded = alreadyAdded?.signal.label === sig.label;
                        return (
                          <button
                            key={sig.label}
                            onClick={() => isAdded ? remove(m.id) : addSignal(m, sig)}
                            disabled={!isAdded && (!!alreadyAdded || selected.length >= 5)}
                            style={{
                              display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                              background: isAdded ? "rgba(16,185,129,0.08)" : "rgba(59,130,246,0.04)",
                              border: `1px solid ${isAdded ? "rgba(16,185,129,0.35)" : "rgba(59,130,246,0.15)"}`,
                              borderRadius: 10, cursor: isAdded || (!alreadyAdded && selected.length < 5) ? "pointer" : "not-allowed",
                              opacity: !isAdded && (!!alreadyAdded || selected.length >= 5) ? 0.4 : 1,
                              textAlign: "left", width: "100%",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f4ff" }}>{sig.label}</div>
                              <div style={{ fontSize: 11, color: "#6b7fa3", marginTop: 2 }}>
                                Model prob: <span style={{ fontFamily: "'DM Mono', monospace", color: "#3b82f6" }}>{sig.prob}%</span>
                              </div>
                            </div>
                            <span style={{ background: `${CONF_COLOR[sig.conf]}18`, color: CONF_COLOR[sig.conf], border: `1px solid ${CONF_COLOR[sig.conf]}35`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600 }}>{sig.conf}</span>
                            <span style={{ background: `${RISK_COLOR[sig.risk]}12`, color: RISK_COLOR[sig.risk], border: `1px solid ${RISK_COLOR[sig.risk]}30`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600 }}>{sig.risk} Risk</span>
                            {isAdded
                              ? <X size={16} color="#ef4444" />
                              : <Plus size={16} color="#3b82f6" />
                            }
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: builder card */}
        <div style={{ position: "sticky", top: 88 }}>
          <div style={{
            background: selected.length > 0 ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,19,39,0.95))" : "#0d1327",
            border: `1px solid ${selected.length > 0 ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.12)"}`,
            borderRadius: 20, padding: 24,
            boxShadow: selected.length > 0 ? "0 0 60px rgba(59,130,246,0.1)" : "none",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Zap size={18} color="#3b82f6" />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20 }}>
                Combo Insight Card
              </span>
              <span style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7fa3" }}>
                {selected.length}/5 signals
              </span>
            </div>

            {selected.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Plus size={32} color="rgba(59,130,246,0.3)" style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "#6b7fa3", fontSize: 14 }}>Add 2–5 signals from matches on the left to build a combination.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {selected.map(s => (
                    <div key={s.matchId} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 2 }}>{s.league}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.match.split(" vs ")[0]} · <span style={{ color: "#3b82f6" }}>{s.signal.label}</span></div>
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#f0f4ff" }}>{s.signal.prob}%</span>
                      <button onClick={() => remove(s.matchId)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <X size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Combined probability */}
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Combined Model Probability</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 44, color: "#3b82f6", lineHeight: 1 }}>{combinedProb.toFixed(1)}%</div>
                  <div style={{ fontSize: 11, color: "#6b7fa3", marginTop: 4 }}>Based on {selected.length} independent signals</div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {conf && <span style={{ flex: 1, textAlign: "center", background: `${CONF_COLOR[conf]}15`, color: CONF_COLOR[conf], border: `1px solid ${CONF_COLOR[conf]}35`, borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700 }}>Combo Confidence: {conf}</span>}
                  {risk && <span style={{ flex: 1, textAlign: "center", background: `${RISK_COLOR[risk]}10`, color: RISK_COLOR[risk], border: `1px solid ${RISK_COLOR[risk]}30`, borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700 }}>Combined Risk: {risk}</span>}
                </div>

                <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, marginBottom: 16 }}>
                  <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 11, color: "#a8b8d8", lineHeight: 1.5 }}>Combined probability reflects independent model signals. This is not a guaranteed outcome. Use for analytical purposes only.</p>
                </div>

                {selected.length >= 2 ? (
                  <button onClick={save} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}>
                    Save Combo Card
                  </button>
                ) : (
                  <div style={{ textAlign: "center", fontSize: 13, color: "#6b7fa3" }}>Add at least 2 signals to save</div>
                )}
              </>
            )}
          </div>

          {/* Saved combos */}
          {saved.length > 0 && (
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Saved Combos ({saved.length})</h4>
              {saved.map((combo, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < saved.length - 1 ? "1px solid rgba(59,130,246,0.08)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{combo.length}-leg Combo</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#3b82f6" }}>{combineProbs(combo).toFixed(1)}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7fa3" }}>{combo.map(s => s.signal.label).join(" · ")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
