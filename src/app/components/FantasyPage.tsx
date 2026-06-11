import { useState } from "react";
import { Trophy, Star, TrendingUp, Zap, RefreshCw, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";

type Platform = "fpl" | "draftkings" | "fanduel";

const FPL_PICKS = [
  { name: "Erling Haaland", position: "FWD", team: "Man City", price: "£14.2m", modelScore: 94, form: "8.4", xGI: "0.82", ownership: "72.3%", signal: "Start", signalColor: "#10b981", reason: "Vs Chelsea — high xG opportunity, 62% home win prob" },
  { name: "Kevin De Bruyne", position: "MID", team: "Man City", price: "£10.8m", modelScore: 88, form: "7.1", xGI: "0.61", ownership: "31.4%", signal: "Start", signalColor: "#10b981", reason: "Key creator in high-confidence home fixture" },
  { name: "Phil Foden", position: "MID", team: "Man City", price: "£9.4m", modelScore: 82, form: "6.8", xGI: "0.54", ownership: "18.2%", signal: "Consider", signalColor: "#f59e0b", reason: "Good rotation risk for budget differential" },
  { name: "Robert Lewandowski", position: "FWD", team: "Barcelona", price: "£10.2m", modelScore: 64, form: "5.9", xGI: "0.44", ownership: "22.1%", signal: "Caution", signalColor: "#f59e0b", reason: "El Clasico — high variance, medium risk fixture" },
  { name: "Adrien Rabiot", position: "MID", team: "Juventus", price: "£5.5m", modelScore: 71, form: "6.2", xGI: "0.38", ownership: "4.8%", signal: "Differential", signalColor: "#8b5cf6", reason: "Low ownership, high set-piece involvement, stable form" },
];

const DK_SLATES = [
  { name: "Haaland", pos: "F", salary: "$11,400", proj: 18.4, ownership: "28%", value: 1.61, signal: "Lock" },
  { name: "De Bruyne", pos: "M", salary: "$9,800", proj: 14.2, ownership: "19%", value: 1.45, signal: "Lock" },
  { name: "Kane", pos: "F", salary: "$10,200", proj: 15.8, ownership: "22%", value: 1.55, signal: "Strong" },
  { name: "Salah", pos: "M", salary: "$9,400", proj: 13.1, ownership: "15%", value: 1.39, signal: "Strong" },
  { name: "Trent Alexander-Arnold", pos: "D", salary: "$6,600", proj: 9.8, ownership: "8%", value: 1.48, signal: "Value" },
  { name: "Adeyemi", pos: "M", salary: "$5,200", proj: 7.4, ownership: "4%", value: 1.42, signal: "Differential" },
];

const SIGNAL_COLOR: Record<string, string> = { Lock: "#10b981", Strong: "#3b82f6", Value: "#f59e0b", Differential: "#8b5cf6", Caution: "#f59e0b", Consider: "#f59e0b", Start: "#10b981" };

export function FantasyPage() {
  const [platform, setPlatform] = useState<Platform>("fpl");
  const [gw, setGw] = useState(36);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Trophy size={22} color="#f59e0b" />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Fantasy Sports Intelligence</h1>
          </div>
          <p style={{ color: "#6b7fa3", fontSize: 15 }}>AI model signals synced to your lineup decisions — FPL, DraftKings, and FanDuel</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7fa3" }}>
          <RefreshCw size={13} /> Updated 2 hours ago
        </div>
      </div>

      {/* Platform + GW selector */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, padding: 4, gap: 4 }}>
          {(["fpl", "draftkings", "fanduel"] as Platform[]).map(p => (
            <button key={p} onClick={() => setPlatform(p)} style={{ padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, background: platform === p ? "#3b82f6" : "transparent", color: platform === p ? "#fff" : "#6b7fa3", border: "none", cursor: "pointer", transition: "all 0.2s" }}>
              {p === "fpl" ? "FPL" : p === "draftkings" ? "DraftKings" : "FanDuel"}
            </button>
          ))}
        </div>
        {platform === "fpl" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#6b7fa3" }}>Gameweek:</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[35, 36, 37, 38].map(w => (
                <button key={w} onClick={() => setGw(w)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: gw === w ? 700 : 400, background: gw === w ? "rgba(59,130,246,0.15)" : "transparent", border: `1px solid ${gw === w ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.12)"}`, color: gw === w ? "#3b82f6" : "#6b7fa3", cursor: "pointer" }}>GW{w}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {platform === "fpl" && (
        <div>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[["GW36 Fixtures", "12 Matches", "#3b82f6"], ["High-Conf. Starters", "6 Players", "#10b981"], ["Top Differential", "Adeyemi (4.8%)", "#8b5cf6"], ["Blanks Flagged", "2 Players", "#f59e0b"]].map(([l, v, c]) => (
              <div key={l as string} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{l}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Player picks */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22 }}>GW{gw} AI Pick Recommendations</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(59,130,246,0.05)" }}>
                  {["Player", "Pos", "Price", "Model Score", "Form", "xGI", "Ownership", "Signal", "AI Reasoning"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FPL_PICKS.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7fa3" }}>{p.team}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p.position}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#a8b8d8" }}>{p.price}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `conic-gradient(${p.modelScore >= 85 ? "#10b981" : p.modelScore >= 70 ? "#3b82f6" : "#f59e0b"} ${p.modelScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0d1327", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500, color: "#f0f4ff" }}>{p.modelScore}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#f0f4ff" }}>{p.form}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#3b82f6" }}>{p.xGI}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#a8b8d8" }}>{p.ownership}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: `${SIGNAL_COLOR[p.signal]}15`, color: SIGNAL_COLOR[p.signal], border: `1px solid ${SIGNAL_COLOR[p.signal]}40`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{p.signal}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7fa3", maxWidth: 220 }}>{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10 }}>
            <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "#a8b8d8", lineHeight: 1.6 }}>Fantasy recommendations are model-derived probability signals. Not guaranteed outcomes. Player availability and late team news may affect accuracy. Always verify official lineups before GW deadline.</p>
          </div>
        </div>
      )}

      {platform === "draftkings" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 16 }}>DK Lineup Optimizer — Today's Slate</h3>
              <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(59,130,246,0.05)" }}>
                      {["Player", "Pos", "Salary", "Proj. Pts", "Value", "Own%", "Signal"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DK_SLATES.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>{p.name}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{p.pos}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#f0f4ff" }}>{p.salary}</td>
                        <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#10b981" }}>{p.proj}</td>
                        <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a8b8d8" }}>{p.value}x</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7fa3" }}>{p.ownership}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: `${SIGNAL_COLOR[p.signal]}15`, color: SIGNAL_COLOR[p.signal], border: `1px solid ${SIGNAL_COLOR[p.signal]}40`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{p.signal}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,19,39,0.9))", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 16, padding: 24 }}>
                <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Optimal Lineup</h4>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7fa3", marginBottom: 8 }}>Salary Used: $49,600 / $50,000</div>
                {[["GK", "Ederson", "$6,200"], ["D", "Trent", "$6,600"], ["M", "De Bruyne", "$9,800"], ["M", "Salah", "$9,400"], ["M", "Adeyemi", "$5,200"], ["F", "Haaland", "$11,400"], ["F", "Kane", "$10,200"]].map(([pos, name, sal]) => (
                  <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                    <span style={{ width: 28, fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" }}>{pos}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{name}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7fa3" }}>{sal}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(16,185,129,0.08)", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#a8b8d8" }}>Projected Total</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#10b981", fontWeight: 500 }}>88.2 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {platform === "fanduel" && (
        <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <Trophy size={40} color="#f59e0b" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>FanDuel Integration Coming Soon</h3>
          <p style={{ color: "#6b7fa3", maxWidth: 400, margin: "0 auto" }}>FanDuel salary data integration is in development. Subscribe for early access notifications.</p>
          <button style={{ marginTop: 24, background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>Notify Me</button>
        </div>
      )}
    </div>
  );
}
