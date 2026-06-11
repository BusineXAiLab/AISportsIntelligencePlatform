import { useState } from "react";
import { Code, Key, Zap, CheckCircle2, Copy, ChevronRight, Terminal, Globe, Shield } from "lucide-react";

const ENDPOINTS = [
  { method: "GET", path: "/v1/predictions/today", desc: "All match predictions for today", tier: "Starter" },
  { method: "GET", path: "/v1/predictions/{matchId}", desc: "Full prediction detail for a match", tier: "Starter" },
  { method: "GET", path: "/v1/accuracy/summary", desc: "Model accuracy summary statistics", tier: "Starter" },
  { method: "GET", path: "/v1/matches/live", desc: "Live match probability updates", tier: "Pro" },
  { method: "GET", path: "/v1/reports/daily", desc: "Daily AI-generated intelligence report", tier: "Pro" },
  { method: "GET", path: "/v1/players/{playerId}/signals", desc: "Player-level model signals", tier: "Enterprise" },
  { method: "POST", path: "/v1/parlay/calculate", desc: "Combined signal probability calculation", tier: "Pro" },
  { method: "GET", path: "/v1/leagues/{leagueId}/predictions", desc: "All predictions for a specific league", tier: "Starter" },
  { method: "GET", path: "/v1/model/version", desc: "Current model version and metadata", tier: "Starter" },
  { method: "POST", path: "/v1/watchlist/alerts", desc: "Register webhook for match alerts", tier: "Enterprise" },
];

const PLANS = [
  { name: "Starter", price: "$199", calls: "100K", rateLimit: "10 req/sec", features: ["Today's predictions", "Accuracy stats", "League filtering", "REST API", "JSON responses"], color: "#3b82f6" },
  { name: "Pro", price: "$599", calls: "1M", rateLimit: "50 req/sec", features: ["Everything in Starter", "Live match updates", "Daily reports", "Parlay calculator", "WebSocket support", "Priority support"], color: "#10b981", highlight: true },
  { name: "Enterprise", price: "Custom", calls: "Unlimited", rateLimit: "Custom", features: ["Everything in Pro", "Player intelligence", "Webhook alerts", "Custom endpoints", "SLA guarantee", "Dedicated engineer"], color: "#f59e0b" },
];

const TIER_COLORS: Record<string, string> = { Starter: "#3b82f6", Pro: "#10b981", Enterprise: "#f59e0b" };
const METHOD_COLORS: Record<string, string> = { GET: "#10b981", POST: "#3b82f6", DELETE: "#ef4444", PATCH: "#f59e0b" };

const SAMPLE_RESPONSE = `{
  "match_id": "PL_2026_0612_001",
  "league": "Premier League",
  "home_team": "Manchester City",
  "away_team": "Chelsea",
  "kickoff": "2026-06-12T18:45:00Z",
  "predictions": {
    "home_win": { "probability": 0.58, "confidence": "high" },
    "draw":     { "probability": 0.24, "confidence": "medium" },
    "away_win": { "probability": 0.18, "confidence": "low" },
    "over_2_5": { "probability": 0.64, "confidence": "high" },
    "btts":     { "probability": 0.52, "confidence": "medium" }
  },
  "risk_level": "medium",
  "model_version": "v3.4.1",
  "last_updated": "2026-06-11T06:02:31Z",
  "responsible_language": {
    "disclaimer": "Model probability estimate only. Not a guaranteed outcome.",
    "compliant": true
  }
}`;

export function APIPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "endpoints" | "quickstart">("overview");
  const [apiKey] = useState("sk_live_••••••••••••••••••••••••4f2a");

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Code size={22} color="#3b82f6" />
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Developer API</h1>
        </div>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Access calibrated match intelligence programmatically. REST API + WebSocket. JSON responses.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 28 }}>
        {(["overview", "endpoints", "quickstart"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: activeTab === tab ? "#3b82f6" : "transparent", color: activeTab === tab ? "#fff" : "#6b7fa3", border: "none", cursor: "pointer", textTransform: "capitalize" }}>{tab}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          {/* API key card */}
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,19,39,0.9))", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Key size={18} color="#3b82f6" />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Your API Key</span>
              <span style={{ marginLeft: "auto", background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Pro Plan Active</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#080c18", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(59,130,246,0.2)" }}>
              <code style={{ flex: 1, fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#a8b8d8", letterSpacing: "0.05em" }}>{apiKey}</code>
              <button onClick={() => copy(apiKey)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Copy size={12} /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
              {[["Calls This Month", "842,193 / 1,000,000", "#3b82f6"], ["Rate Limit", "50 req/sec", "#10b981"], ["Reset Date", "Jul 1, 2026", "#a8b8d8"]].map(([l, v, c]) => (
                <div key={l as string}>
                  <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[["Avg Latency", "48ms", "#10b981"], ["Uptime (30d)", "99.98%", "#3b82f6"], ["Endpoints", "10", "#f59e0b"], ["Data Freshness", "< 60s", "#8b5cf6"]].map(([l, v, c]) => (
              <div key={l as string} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{l}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: plan.highlight ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,19,39,0.9))" : "#0d1327", border: `1px solid ${plan.highlight ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.12)"}`, borderRadius: 16, padding: "28px 24px" }}>
                <div style={{ color: plan.color, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{plan.name}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, color: "#f0f4ff", marginBottom: 4 }}>{plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: "#6b7fa3" }}>/mo</span></div>
                <div style={{ fontSize: 12, color: "#6b7fa3", marginBottom: 20 }}>{plan.calls} calls · {plan.rateLimit}</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "#a8b8d8" }}>
                      <CheckCircle2 size={14} color={plan.color} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button style={{ width: "100%", background: plan.highlight ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.06)", border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get API Key"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "endpoints" && (
        <div>
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22 }}>API Reference — All Endpoints</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(59,130,246,0.05)" }}>
                  {["Method", "Endpoint", "Description", "Tier"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((ep, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)", cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.03)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: `${METHOD_COLORS[ep.method]}15`, color: METHOD_COLORS[ep.method], border: `1px solid ${METHOD_COLORS[ep.method]}35`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{ep.method}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3b82f6" }}>{ep.path}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#a8b8d8" }}>{ep.desc}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: `${TIER_COLORS[ep.tier]}12`, color: TIER_COLORS[ep.tier], border: `1px solid ${TIER_COLORS[ep.tier]}30`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{ep.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20 }}>Sample Response — GET /v1/predictions/{"{matchId}"}</h4>
              <button onClick={() => copy(SAMPLE_RESPONSE)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Copy size={12} /> Copy
              </button>
            </div>
            <pre style={{ background: "#060910", borderRadius: 12, padding: 20, fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a8b8d8", overflowX: "auto", lineHeight: 1.7, margin: 0 }}>
              {SAMPLE_RESPONSE}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "quickstart" && (
        <div style={{ maxWidth: 700 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Quickstart Guide</h3>
          {[
            { step: "01", title: "Get your API Key", desc: "Sign up or upgrade to a paid API plan. Your key is generated instantly.", code: null },
            { step: "02", title: "Make your first call", desc: "Fetch today's predictions using your API key in the Authorization header.", code: `curl https://api.sportsintelai.com/v1/predictions/today \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"` },
            { step: "03", title: "Parse the response", desc: "All responses return JSON with probability, confidence, and responsible language flags.", code: `const res = await fetch('/v1/predictions/today', {
  headers: { Authorization: \`Bearer \${API_KEY}\` }
});
const { predictions } = await res.json();` },
            { step: "04", title: "Set up webhooks (Pro+)", desc: "Register a webhook URL to receive real-time alerts when model probabilities shift significantly.", code: `curl -X POST https://api.sportsintelai.com/v1/watchlist/alerts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"webhook_url":"https://yourdomain.com/hook","threshold":0.08}'` },
          ].map(({ step, title, desc, code }) => (
            <div key={step} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, color: "rgba(59,130,246,0.3)", lineHeight: 1, flexShrink: 0, width: 40 }}>{step}</span>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{title}</h4>
                  <p style={{ color: "#6b7fa3", fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
              {code && (
                <div style={{ position: "relative" }}>
                  <pre style={{ background: "#060910", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "16px 20px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a8b8d8", overflowX: "auto", lineHeight: 1.7, margin: 0 }}>
                    {code}
                  </pre>
                  <button onClick={() => copy(code)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Copy size={11} /> Copy
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
