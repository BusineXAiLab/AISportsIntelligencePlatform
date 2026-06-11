import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from "recharts";
import { Info } from "lucide-react";

const LEAGUE_ACCURACY = [
  { league: "Premier League", accuracy: 69.2, predictions: 342 },
  { league: "La Liga", accuracy: 71.4, predictions: 298 },
  { league: "Bundesliga", accuracy: 74.1, predictions: 276 },
  { league: "Serie A", accuracy: 67.8, predictions: 264 },
  { league: "Ligue 1", accuracy: 65.3, predictions: 218 },
  { league: "Champions Lg", accuracy: 72.6, predictions: 184 },
];

const TREND_DATA = [
  { month: "Jan", accuracy: 66.2 }, { month: "Feb", accuracy: 68.4 },
  { month: "Mar", accuracy: 67.1 }, { month: "Apr", accuracy: 70.8 },
  { month: "May", accuracy: 72.3 }, { month: "Jun", accuracy: 68.9 },
];

const RECENT_PREDICTIONS = [
  { match: "Arsenal vs Man Utd", league: "PL", prediction: "Home Win", actual: "Home Win", confidence: "High", result: "correct" },
  { match: "Lyon vs Nice", league: "L1", prediction: "Draw", actual: "Away Win", confidence: "Medium", result: "incorrect" },
  { match: "Napoli vs Roma", league: "SA", prediction: "Home Win", actual: "Home Win", confidence: "High", result: "correct" },
  { match: "Leverkusen vs Stuttgart", league: "BL", prediction: "Home Win", actual: "Home Win", confidence: "High", result: "correct" },
  { match: "Atletico vs Villarreal", league: "LL", prediction: "Home Win", actual: "Draw", confidence: "Medium", result: "incorrect" },
  { match: "Man City vs Everton", league: "PL", prediction: "Home Win", actual: "Home Win", confidence: "High", result: "correct" },
];

const TYPE_ACCURACY = [
  { type: "Home Win", accuracy: 71.4, color: "#3b82f6" },
  { type: "Away Win", accuracy: 62.8, color: "#6b7fa3" },
  { type: "Draw", accuracy: 51.3, color: "#f59e0b" },
  { type: "Over 2.5", accuracy: 66.1, color: "#10b981" },
  { type: "BTTS", accuracy: 64.7, color: "#8b5cf6" },
];

export function AccuracyPage() {
  const [league, setLeague] = useState("All");
  const [dateRange, setDateRange] = useState("30d");
  const [confFilter, setConfFilter] = useState("All");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, marginBottom: 4 }}>Prediction Accuracy Dashboard</h1>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Historical model performance — tracked transparently over time</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "League", opts: ["All", "Premier League", "La Liga", "Bundesliga", "Serie A"], val: league, set: setLeague },
          { label: "Date Range", opts: ["7d", "30d", "90d", "Season"], val: dateRange, set: setDateRange },
          { label: "Confidence", opts: ["All", "High", "Medium", "Low"], val: confFilter, set: setConfFilter },
        ].map(({ label, opts, val, set }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7fa3" }}>{label}:</span>
            <select
              value={val}
              onChange={e => set(e.target.value)}
              style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "6px 12px", color: "#f0f4ff", fontSize: 13, cursor: "pointer" }}
            >
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Overall stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Overall Accuracy", value: "68.3%", color: "#3b82f6", sub: "Last 30 days" },
          { label: "High Conf. Accuracy", value: "74.1%", color: "#10b981", sub: "High confidence only" },
          { label: "Total Predictions", value: "1,582", color: "#f59e0b", sub: "This season" },
          { label: "Correct Predictions", value: "1,081", color: "#8b5cf6", sub: "This season" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 11, color: "#6b7fa3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: "#6b7fa3" }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

        {/* Accuracy by type */}
        <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Accuracy by Prediction Type</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {TYPE_ACCURACY.map(({ type, accuracy, color }) => (
              <div key={type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#a8b8d8" }}>{type}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color }}>{accuracy}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${accuracy}%`, background: color, borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy trend */}
        <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Model Performance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 80]} tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, "Accuracy"]}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By league */}
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Accuracy by League</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={LEAGUE_ACCURACY} margin={{ left: 0 }}>
            <XAxis dataKey="league" tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 80]} tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, "Accuracy"]}
            />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
              {LEAGUE_ACCURACY.map((entry, i) => (
                <Cell key={`league-cell-${i}`} fill={entry.accuracy >= 72 ? "#10b981" : entry.accuracy >= 68 ? "#3b82f6" : "#6b7fa3"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent predictions table */}
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20 }}>Recent Prediction Results</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(59,130,246,0.06)" }}>
                {["Match", "League", "Model Prediction", "Actual Result", "Confidence", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_PREDICTIONS.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#f0f4ff", fontWeight: 500 }}>{row.match}</td>
                  <td style={{ padding: "14px 16px", fontSize: 11, color: "#6b7fa3", fontFamily: "'DM Mono', monospace" }}>{row.league}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#a8b8d8" }}>{row.prediction}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#a8b8d8" }}>{row.actual}</td>
                  <td style={{ padding: "14px 16px" }}><ConfBadge level={row.confidence} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: row.result === "correct" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      color: row.result === "correct" ? "#10b981" : "#ef4444",
                      border: `1px solid ${row.result === "correct" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize",
                    }}>
                      {row.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 12, padding: 20, display: "flex", gap: 10 }}>
        <Info size={15} color="#6b7fa3" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: "#6b7fa3", fontSize: 12, lineHeight: 1.6 }}>
          Accuracy metrics reflect historical model performance only. All data uses the "model probability indicates higher likelihood" framework — not guaranteed outcomes. Past performance does not guarantee future results. Confidence calibration is updated weekly.
        </p>
      </div>
    </div>
  );
}

function ConfBadge({ level }: { level: string }) {
  const c: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  return (
    <span style={{ background: `${c[level]}18`, color: c[level], border: `1px solid ${c[level]}35`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {level}
    </span>
  );
}
