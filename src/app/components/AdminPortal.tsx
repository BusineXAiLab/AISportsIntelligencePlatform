import { useState } from "react";
import { Users, CreditCard, Activity, FileText, Send, Cpu, Database, Shield, Settings, CheckCircle2, XCircle, AlertTriangle, Edit2, ChevronRight, BarChart2, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

type AdminSection = "overview" | "users" | "predictions" | "reports" | "telegram" | "model" | "settings";

const REVENUE_TREND = [
  { day: "Mon", revenue: 1240 }, { day: "Tue", revenue: 1580 }, { day: "Wed", revenue: 1320 },
  { day: "Thu", revenue: 1890 }, { day: "Fri", revenue: 2100 }, { day: "Sat", revenue: 1760 },
  { day: "Sun", revenue: 2240 },
];

const PREDICTIONS_QUEUE = [
  { match: "Manchester City vs Chelsea", league: "PL", kickoff: "19:45", homeWin: 58, draw: 24, awayWin: 18, confidence: "High", risk: "Medium", status: "pending" },
  { match: "Real Madrid vs Barcelona", league: "LL", kickoff: "20:00", homeWin: 45, draw: 28, awayWin: 27, confidence: "Medium", risk: "High", status: "approved" },
  { match: "Bayern Munich vs Dortmund", league: "BL", kickoff: "18:30", homeWin: 62, draw: 20, awayWin: 18, confidence: "High", risk: "Low", status: "pending" },
  { match: "PSG vs Marseille", league: "L1", kickoff: "21:00", homeWin: 67, draw: 18, awayWin: 15, confidence: "High", risk: "Low", status: "approved" },
  { match: "Inter Milan vs AC Milan", league: "SA", kickoff: "20:45", homeWin: 51, draw: 26, awayWin: 23, confidence: "Medium", risk: "Medium", status: "rejected" },
];

const NAV_ITEMS = [
  { id: "overview" as AdminSection, label: "Overview", icon: BarChart2 },
  { id: "users" as AdminSection, label: "Users", icon: Users },
  { id: "predictions" as AdminSection, label: "Predictions", icon: Activity },
  { id: "reports" as AdminSection, label: "Reports", icon: FileText },
  { id: "telegram" as AdminSection, label: "Telegram Posts", icon: Send },
  { id: "model" as AdminSection, label: "Model Status", icon: Cpu },
];

export function AdminPortal() {
  const [section, setSection] = useState<AdminSection>("overview");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#060910", minHeight: "100vh", color: "#f0f4ff", display: "flex" }}>

      {/* Admin sidebar */}
      <aside style={{ width: 220, background: "#080c18", borderRight: "1px solid rgba(59,130,246,0.15)", padding: "24px 12px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px", marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #dc2626)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.06em" }}>
            ADMIN<span style={{ color: "#ef4444" }}>PORTAL</span>
          </span>
        </div>

        {NAV_ITEMS.map(item => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                color: active ? "#3b82f6" : "#6b7fa3",
                background: active ? "rgba(59,130,246,0.1)" : "transparent",
                borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                fontWeight: active ? 600 : 400, fontSize: 14,
                marginBottom: 2, cursor: "pointer", width: "100%", textAlign: "left",
              }}
            >
              <item.icon size={16} /> {item.label}
            </button>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(59,130,246,0.1)" }}>
          <button
            onClick={() => setSection("settings")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              color: section === "settings" ? "#3b82f6" : "#6b7fa3",
              background: section === "settings" ? "rgba(59,130,246,0.1)" : "transparent",
              borderLeft: section === "settings" ? "3px solid #3b82f6" : "3px solid transparent",
              fontWeight: section === "settings" ? 600 : 400,
              fontSize: 14, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </aside>

      {/* Admin content */}
      <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        {section === "overview" && <AdminOverview onNav={setSection} />}
        {section === "predictions" && <AdminPredictions />}
        {section === "reports" && <AdminReports />}
        {section === "users" && <AdminUsers />}
        {section === "model" && <AdminModel />}
        {section === "telegram" && <AdminTelegram />}
        {section === "settings" && <AdminSettings />}
      </main>
    </div>
  );
}

function AdminOverview({ onNav }: { onNav: (s: AdminSection) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, marginBottom: 4 }}>Admin Overview</h1>
        <div style={{ fontSize: 12, color: "#6b7fa3" }}>June 11, 2026 · Last refreshed 06:15 AM</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Active Subscribers", value: "4,218", delta: "+24", color: "#3b82f6", icon: Users },
          { label: "Today's Predictions", value: "14", delta: "Generated", color: "#10b981", icon: Activity },
          { label: "Reports Pending", value: "3", delta: "Needs review", color: "#f59e0b", icon: FileText },
          { label: "Data Feed Status", value: "Live", delta: "All feeds OK", color: "#10b981", icon: Database },
          { label: "Telegram Delivered", value: "98.2%", delta: "Today", color: "#8b5cf6", icon: Send },
          { label: "Failed Jobs", value: "0", delta: "Last 24h", color: "#10b981", icon: AlertTriangle },
          { label: "Model Accuracy", value: "72.1%", delta: "7-day avg", color: "#3b82f6", icon: Cpu },
          { label: "Revenue Today", value: "$840", delta: "+12%", color: "#f59e0b", icon: CreditCard },
        ].map(({ label, value, delta, color, icon: Icon }) => (
          <div key={label} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#6b7fa3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
              <Icon size={15} color={color} />
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: "#6b7fa3" }}>{delta}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>7-Day Revenue</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={REVENUE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }} formatter={(v: number) => [`$${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System status */}
        <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>System Status</h3>
          {[
            { label: "Data Feed (Opta)", status: "Operational" },
            { label: "AI Model Pipeline", status: "Operational" },
            { label: "Telegram Bot", status: "Operational" },
            { label: "Dashboard CDN", status: "Operational" },
            { label: "Payment Gateway", status: "Operational" },
            { label: "Report Generator", status: "Degraded" },
          ].map(({ label, status }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
              <span style={{ fontSize: 13, color: "#a8b8d8" }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: status === "Operational" ? "#10b981" : "#f59e0b" }}>
                ● {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onNav("predictions")} style={{ display: "flex", alignItems: "center", gap: 8, color: "#3b82f6", fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
        Review Pending Predictions <ChevronRight size={16} />
      </button>
    </div>
  );
}

function AdminPredictions() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 8 }}>Prediction Review</h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 24 }}>Review, approve, edit, or reject model-generated predictions before publishing.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PREDICTIONS_QUEUE.map((pred, i) => (
          <div key={i} style={{ background: "#0d1327", border: `1px solid ${pred.status === "pending" ? "rgba(245,158,11,0.3)" : pred.status === "approved" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: "#6b7fa3", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{pred.league}</span>
                  <ConfBadge level={pred.confidence} />
                  <RiskBadge level={pred.risk} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{pred.match}</div>
                <div style={{ fontSize: 12, color: "#6b7fa3" }}>Kickoff: {pred.kickoff}</div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                {[["Home", pred.homeWin], ["Draw", pred.draw], ["Away", pred.awayWin]].map(([label, val]) => (
                  <div key={label as string} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, color: "#f0f4ff" }}>{val}%</div>
                    <div style={{ fontSize: 10, color: "#6b7fa3", textTransform: "uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                {pred.status === "pending" ? (
                  <>
                    <button style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                ) : (
                  <span style={{
                    padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: pred.status === "approved" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    color: pred.status === "approved" ? "#10b981" : "#ef4444",
                    border: `1px solid ${pred.status === "approved" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    textTransform: "capitalize",
                  }}>
                    {pred.status}
                  </span>
                )}
              </div>
            </div>

            {/* AI explanation excerpt */}
            <div style={{ marginTop: 14, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#6b7fa3", lineHeight: 1.6 }}>
              Model explanation: Higher likelihood for home team based on recent form and home advantage. Model confidence calibrated at High level. Responsible language check: ✓ Pass
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReports() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 24 }}>Report Publishing</h2>
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>DRAFT</span>
          <span style={{ fontSize: 11, color: "#6b7fa3" }}>Daily Brief · June 11, 2026</span>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Daily Intelligence Brief — June 11</h3>
        <textarea
          defaultValue="14 matches analyzed across 6 leagues today. The model identifies 6 high-confidence signals, with the strongest coming from Bundesliga and Premier League fixtures. Risk distribution: 43% Low, 36% Medium, 21% High. Key signals are outlined in full detail below..."
          style={{
            width: "100%", height: 140, background: "#131d3a",
            border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 16,
            color: "#f0f4ff", fontSize: 14, lineHeight: 1.7,
            resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
        />

        {/* Language check */}
        <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", marginTop: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>
            <CheckCircle2 size={15} /> Responsible Language Check — Passed
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["No 'guaranteed' language ✓", "No 'sure' predictions ✓", "No 'risk-free' claims ✓", "Probability framing used ✓"].map(check => (
              <span key={check} style={{ fontSize: 12, color: "#a8b8d8" }}>{check}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
            Publish to Dashboard
          </button>
          <button style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={14} /> Publish to Telegram
          </button>
          <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#a8b8d8", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Schedule Post
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 24 }}>User Management</h2>
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(59,130,246,0.06)" }}>
              {["User", "Plan", "Status", "Joined", "Telegram", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "John Smith", email: "john@example.com", plan: "Elite", status: "Active", joined: "Jan 12, 2026", telegram: "Connected" },
              { name: "Sarah Chen", email: "sarah@example.com", plan: "Premium", status: "Active", joined: "Feb 3, 2026", telegram: "Connected" },
              { name: "Marcus Hill", email: "marcus@example.com", plan: "Free", status: "Active", joined: "Apr 18, 2026", telegram: "Not linked" },
              { name: "Layla Ahmed", email: "layla@example.com", plan: "Premium", status: "Expired", joined: "Dec 1, 2025", telegram: "Connected" },
            ].map((user, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7fa3" }}>{user.email}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: user.plan === "Elite" ? "#f59e0b" : user.plan === "Premium" ? "#3b82f6" : "#6b7fa3" }}>{user.plan}</span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: user.status === "Active" ? "#10b981" : "#ef4444" }}>● {user.status}</span>
                </td>
                <td style={{ padding: "14px 18px", fontSize: 12, color: "#a8b8d8" }}>{user.joined}</td>
                <td style={{ padding: "14px 18px", fontSize: 12, color: user.telegram === "Connected" ? "#10b981" : "#6b7fa3" }}>{user.telegram}</td>
                <td style={{ padding: "14px 18px" }}>
                  <button style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminModel() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 24 }}>Model Status</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Model Version", value: "v3.4.1", color: "#3b82f6" },
          { label: "Last Training Run", value: "Jun 8, 2026", color: "#10b981" },
          { label: "Features Used", value: "184", color: "#f59e0b" },
          { label: "Pipeline Status", value: "Healthy", color: "#10b981" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Data Feed Status</h3>
        {[
          { feed: "Opta Stats (Primary)", latency: "84ms", status: "Live", coverage: "Top 12 leagues" },
          { feed: "Sportradar (Secondary)", latency: "120ms", status: "Live", coverage: "Top 6 leagues" },
          { feed: "Internal Scraper", latency: "340ms", status: "Live", coverage: "Supplemental" },
          { feed: "Weather API", latency: "52ms", status: "Live", coverage: "Global" },
        ].map((feed, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(59,130,246,0.06)", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{feed.feed}</div>
              <div style={{ fontSize: 12, color: "#6b7fa3" }}>{feed.coverage}</div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a8b8d8" }}>Latency: {feed.latency}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>● {feed.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTelegram() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 24 }}>Telegram Posts</h2>
      <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {["Delivered", "Scheduled", "Draft"].map(tab => (
            <button key={tab} style={{ padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600, background: tab === "Delivered" ? "#3b82f6" : "rgba(59,130,246,0.08)", border: `1px solid ${tab === "Delivered" ? "#3b82f6" : "rgba(59,130,246,0.2)"}`, color: tab === "Delivered" ? "#fff" : "#a8b8d8", cursor: "pointer" }}>
              {tab}
            </button>
          ))}
        </div>
        {[
          { time: "06:02 AM", text: "📊 Daily Intelligence Brief — 14 matches, 6 high-confidence signals", status: "delivered", reach: "4,218" },
          { time: "09:30 AM", text: "⚡ El Clasico tactical preview published — premium report available", status: "delivered", reach: "4,218" },
          { time: "03:00 PM", text: "⚡ Pre-match alerts: 3 high-confidence matches kicking off in 4h", status: "scheduled", reach: "—" },
        ].map((post, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid rgba(59,130,246,0.06)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#f0f4ff", marginBottom: 4 }}>{post.text}</div>
              <div style={{ fontSize: 11, color: "#6b7fa3" }}>{post.time} · Reach: {post.reach}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: post.status === "delivered" ? "#10b981" : "#f59e0b" }}>
              ● {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 8 }}>Settings</h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 28 }}>Platform configuration, API keys, and admin preferences.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* General */}
        <Section title="General">
          {[
            { label: "Platform Name", value: "SportsIntelAI", type: "text" },
            { label: "Support Email", value: "support@sportsintelai.com", type: "email" },
            { label: "Default Timezone", value: "UTC", type: "text" },
          ].map(field => (
            <SettingRow key={field.label} label={field.label}>
              <input
                defaultValue={field.value}
                type={field.type}
                style={{ background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, width: 280, outline: "none" }}
              />
            </SettingRow>
          ))}
        </Section>

        {/* Model */}
        <Section title="AI Model">
          {[
            { label: "Model Version", value: "v3.4.1" },
            { label: "Confidence Threshold (High)", value: "0.72" },
            { label: "Risk Cap (auto-reject above)", value: "0.85" },
          ].map(field => (
            <SettingRow key={field.label} label={field.label}>
              <input
                defaultValue={field.value}
                style={{ background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, width: 200, outline: "none", fontFamily: "'DM Mono', monospace" }}
              />
            </SettingRow>
          ))}
          <SettingRow label="Auto-approve High Conf. + Low Risk">
            <Toggle defaultOn={false} />
          </SettingRow>
          <SettingRow label="Require human review for all predictions">
            <Toggle defaultOn={true} />
          </SettingRow>
        </Section>

        {/* Telegram */}
        <Section title="Telegram">
          <SettingRow label="Bot Token">
            <input
              defaultValue="••••••••••••••••••••••••"
              type="password"
              style={{ background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, width: 280, outline: "none" }}
            />
          </SettingRow>
          <SettingRow label="VIP Channel ID">
            <input
              defaultValue="-1001234567890"
              style={{ background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, width: 200, outline: "none", fontFamily: "'DM Mono', monospace" }}
            />
          </SettingRow>
          <SettingRow label="Pre-match alert lead time">
            <select
              defaultValue="4h"
              style={{ background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, cursor: "pointer" }}
            >
              {["1h", "2h", "4h", "6h", "12h"].map(o => <option key={o}>{o}</option>)}
            </select>
          </SettingRow>
          <SettingRow label="Daily brief delivery time">
            <input
              defaultValue="07:00"
              type="time"
              style={{ background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, outline: "none" }}
            />
          </SettingRow>
        </Section>

        {/* Responsible language */}
        <Section title="Responsible Language Checks">
          <SettingRow label="Block 'guaranteed' language">
            <Toggle defaultOn={true} />
          </SettingRow>
          <SettingRow label="Block 'sure bet' language">
            <Toggle defaultOn={true} />
          </SettingRow>
          <SettingRow label="Auto-append disclaimer to reports">
            <Toggle defaultOn={true} />
          </SettingRow>
          <SettingRow label="Require disclaimer sign-off before publish">
            <Toggle defaultOn={false} />
          </SettingRow>
        </Section>

        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
            Save Changes
          </button>
          <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#a8b8d8", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(59,130,246,0.1)", fontSize: 13, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </div>
      <div style={{ padding: "8px 0" }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid rgba(59,130,246,0.06)", gap: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: 14, color: "#a8b8d8" }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      onClick={() => setOn(!on)}
      style={{
        width: 44, height: 24, borderRadius: 100,
        background: on ? "#3b82f6" : "#1e2d54",
        border: `1px solid ${on ? "#3b82f6" : "rgba(59,130,246,0.2)"}`,
        position: "relative", cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 22 : 2, transition: "left 0.2s" }} />
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
