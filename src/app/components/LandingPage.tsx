import { Shield, Brain, TrendingUp, Bell, Lock, ChevronRight, Star, CheckCircle2, Zap } from "lucide-react";

type Page = "landing" | "pricing" | "login" | "register" | "dashboard" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";

interface Props {
  onNavigate: (page: Page) => void;
}

const SAMPLE_MATCHES = [
  {
    league: "Premier League",
    home: "Manchester City",
    away: "Chelsea",
    homeShort: "MCI",
    awayShort: "CHE",
    kickoff: "Today, 19:45",
    homeProb: 58,
    drawProb: 24,
    awayProb: 18,
    confidence: "High",
    risk: "Medium",
    signal: "Home Advantage",
  },
  {
    league: "La Liga",
    home: "Real Madrid",
    away: "Barcelona",
    homeShort: "RMA",
    awayShort: "BAR",
    kickoff: "Today, 20:00",
    homeProb: 45,
    drawProb: 28,
    awayProb: 27,
    confidence: "Medium",
    risk: "High",
    signal: "Form Divergence",
    locked: true,
  },
  {
    league: "Bundesliga",
    home: "Bayern Munich",
    away: "Dortmund",
    homeShort: "BAY",
    awayShort: "BVB",
    kickoff: "Today, 18:30",
    homeProb: 62,
    drawProb: 20,
    awayProb: 18,
    confidence: "High",
    risk: "Low",
    signal: "Dominant Form",
  },
];

const FEATURES = [
  { icon: Brain, title: "Probability-Based Predictions", desc: "AI models produce calibrated probability distributions — not picks, not tips. Understand the data behind each signal." },
  { icon: TrendingUp, title: "AI-Generated Reports", desc: "Daily match intelligence reports with tactical summaries, form analysis, and risk assessments delivered to your dashboard." },
  { icon: Shield, title: "Historical Accuracy Tracking", desc: "Full transparency on model performance over time. Track confidence calibration, prediction accuracy, and trend data." },
  { icon: Bell, title: "Telegram VIP Alerts", desc: "Premium subscribers get real-time match intelligence alerts delivered to a private Telegram VIP channel." },
  { icon: Star, title: "Responsible Insights", desc: "We use responsible prediction language: probability, confidence, model signal. Not guaranteed outcomes." },
  { icon: Zap, title: "Data-Driven Intelligence", desc: "Powered by comprehensive data ingestion: team form, player availability, fixture density, historical matchups and more." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Data Ingestion", desc: "Real-time feeds: team form, lineup news, weather, historical head-to-head, fixture density, player availability." },
  { step: "02", title: "AI Model Analysis", desc: "Ensemble models process hundreds of variables to generate calibrated probability distributions for each match outcome." },
  { step: "03", title: "Confidence Scoring", desc: "Each prediction receives a confidence score based on data quality, model agreement, and historical calibration." },
  { step: "04", title: "Human Review", desc: "Our analyst team reviews high-signal outputs, adds tactical context, and verifies responsible language usage." },
  { step: "05", title: "Dashboard & Telegram Delivery", desc: "Predictions publish to your subscriber dashboard and VIP Telegram channel simultaneously at kickoff minus 4 hours." },
];

function TeamBadge({ code }: { code: string }) {
  return (
    <div
      style={{
        width: 40, height: 40,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #131d3a, #1e2d54)",
        border: "1px solid rgba(59,130,246,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: 11, color: "#a8b8d8",
        letterSpacing: "0.05em",
      }}
    >
      {code}
    </div>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  return (
    <span
      style={{
        background: `${colors[level]}20`,
        color: colors[level],
        border: `1px solid ${colors[level]}40`,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {level}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };
  return (
    <span
      style={{
        background: `${colors[level]}15`,
        color: colors[level],
        border: `1px solid ${colors[level]}30`,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {level} Risk
    </span>
  );
}

export function LandingPage({ onNavigate }: Props) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff" }}>

      {/* Hero */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Grid lines bg */}
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 100, padding: "6px 16px",
            fontSize: 12, fontWeight: 600, color: "#3b82f6",
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 32,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          Powered by AI · Football Intelligence
        </div>

        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 7vw, 80px)",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          AI-Powered<br />
          <span style={{ background: "linear-gradient(90deg, #3b82f6, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Football Intelligence
          </span>
        </h1>

        <p style={{ fontSize: 18, color: "#a8b8d8", maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
          Data-driven match predictions, confidence scores, and premium football insights powered by AI. Built for serious fans who demand transparency.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => onNavigate("dashboard")}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", borderRadius: 12,
              padding: "14px 32px", fontSize: 15, fontWeight: 600,
              boxShadow: "0 0 30px rgba(59,130,246,0.3)",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            View Today's Insights <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onNavigate("pricing")}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f0f4ff", borderRadius: 12,
              padding: "14px 32px", fontSize: 15, fontWeight: 600,
            }}
          >
            Start Premium
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48, marginTop: 72, flexWrap: "wrap", justifyContent: "center" }}>
          {[["94.2%", "Model Uptime"], ["12,400+", "Predictions Tracked"], ["68.3%", "Avg. Accuracy"], ["4,200+", "Active Subscribers"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, color: "#3b82f6", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "#6b7fa3", marginTop: 4, letterSpacing: "0.04em" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 48, letterSpacing: "-0.01em" }}>
            Intelligence, Not Tipsters
          </h2>
          <p style={{ color: "#a8b8d8", fontSize: 16, marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>
            Everything you need to make informed decisions with data — not gut feeling.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "#0d1327",
                border: "1px solid rgba(59,130,246,0.12)",
                borderRadius: 16, padding: "28px 24px",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.35)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.12)"; }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon size={20} color="#3b82f6" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: "#6b7fa3", fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Predictions Preview */}
      <section style={{ padding: "80px 24px", background: "rgba(13,19,39,0.6)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Today's Intelligence Preview</h2>
              <p style={{ color: "#6b7fa3", marginTop: 4 }}>3 of 14 matches available today — subscribe for full access</p>
            </div>
            <button
              onClick={() => onNavigate("pricing")}
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600 }}
            >
              Unlock All →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {SAMPLE_MATCHES.map((match, i) => (
              <div
                key={i}
                style={{
                  background: "#0d1327",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* League header */}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa3", letterSpacing: "0.06em", textTransform: "uppercase" }}>{match.league}</span>
                  <span style={{ fontSize: 12, color: "#a8b8d8" }}>{match.kickoff}</span>
                </div>

                <div style={{ padding: "20px", position: "relative" }}>
                  {/* Teams */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <TeamBadge code={match.homeShort} />
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, maxWidth: 100 }}>{match.home}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7fa3", fontWeight: 600 }}>VS</div>
                    <div style={{ textAlign: "center" }}>
                      <TeamBadge code={match.awayShort} />
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, maxWidth: 100 }}>{match.away}</div>
                    </div>
                  </div>

                  {/* Signal */}
                  <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    Model Signal: {match.signal}
                  </div>

                  {/* Probabilities */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[["Home", match.homeProb], ["Draw", match.drawProb], ["Away", match.awayProb]].map(([label, prob]) => (
                      <div key={label as string} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 4px" }}>
                        <div style={{ fontSize: 18, fontFamily: "'DM Mono', monospace", fontWeight: 500, color: "#f0f4ff" }}>{prob}%</div>
                        <div style={{ fontSize: 11, color: "#6b7fa3", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <ConfidenceBadge level={match.confidence} />
                    <RiskBadge level={match.risk} />
                  </div>

                  {match.locked ? (
                    <div
                      style={{
                        position: "absolute", inset: 0,
                        background: "rgba(8,12,24,0.8)",
                        backdropFilter: "blur(4px)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 12, borderRadius: 0,
                      }}
                    >
                      <Lock size={28} color="#6b7fa3" />
                      <span style={{ fontSize: 13, color: "#a8b8d8", fontWeight: 500 }}>Premium Insight Locked</span>
                      <button
                        onClick={() => onNavigate("pricing")}
                        style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600 }}
                      >
                        Unlock →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate("match-detail")}
                      style={{ width: "100%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6", borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 600 }}
                    >
                      View Analysis →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 48 }}>How It Works</h2>
          <p style={{ color: "#a8b8d8", marginTop: 8 }}>Five stages from raw data to your intelligence dashboard</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              style={{
                display: "flex", gap: 32, alignItems: "flex-start",
                padding: "28px 0",
                borderBottom: i < HOW_IT_WORKS.length - 1 ? "1px solid rgba(59,130,246,0.1)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 48,
                  color: "rgba(59,130,246,0.2)",
                  lineHeight: 1, flexShrink: 0, width: 60,
                }}
              >
                {step.step}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "#f0f4ff" }}>{step.title}</h3>
                <p style={{ color: "#6b7fa3", lineHeight: 1.6, fontSize: 15 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section style={{ padding: "80px 24px", background: "rgba(13,19,39,0.6)", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 48, marginBottom: 16 }}>Choose Your Intelligence Tier</h2>
          <p style={{ color: "#a8b8d8", marginBottom: 48, fontSize: 16 }}>Start free. Upgrade when you're ready for the full signal.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, maxWidth: 780, margin: "0 auto" }}>
            {[
              { name: "Free", price: "$0", color: "#6b7fa3", features: ["3 daily predictions", "Public Telegram", "Basic match previews"] },
              { name: "Premium", price: "$19.99", color: "#3b82f6", features: ["Full dashboard", "VIP Telegram", "Daily AI reports", "Confidence scoring"], highlight: true },
              { name: "Elite", price: "$49.99", color: "#f59e0b", features: ["Advanced analytics", "Priority insights", "Historical performance", "Player intelligence"] },
            ].map(plan => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlight ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.08))" : "#0d1327",
                  border: `1px solid ${plan.highlight ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.12)"}`,
                  borderRadius: 16, padding: "28px 24px",
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                      background: "linear-gradient(90deg, #3b82f6, #10b981)",
                      borderRadius: 100, padding: "4px 16px",
                      fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.05em",
                    }}
                  >
                    RECOMMENDED
                  </div>
                )}
                <div style={{ color: plan.color, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, color: "#f0f4ff", marginBottom: 20 }}>{plan.price}<span style={{ fontSize: 16, fontWeight: 400, color: "#6b7fa3" }}>/mo</span></div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#a8b8d8" }}>
                      <CheckCircle2 size={14} color={plan.color} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate("pricing")}
                  style={{
                    width: "100%",
                    background: plan.highlight ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.06)",
                    border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
                    color: "#fff", borderRadius: 10, padding: "12px",
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {plan.name === "Free" ? "Start Free" : plan.name === "Premium" ? "Go Premium" : "Join Elite"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#080c18", borderTop: "1px solid rgba(59,130,246,0.1)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", marginBottom: 40 }}>
            <div style={{ flex: "0 0 280px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={14} color="#fff" />
                </div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.05em" }}>
                  SPORTSINTEL<span style={{ color: "#3b82f6" }}>AI</span>
                </span>
              </div>
              <p style={{ color: "#6b7fa3", fontSize: 13, lineHeight: 1.6 }}>
                Data-driven football intelligence. Our model provides probability-based signals, not guaranteed outcomes. Always use responsibly.
              </p>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                { label: "Platform", links: ["Dashboard", "Predictions", "Reports", "Accuracy"] },
                { label: "Company", links: ["About", "Contact", "Careers"] },
                { label: "Legal", links: ["Terms of Service", "Privacy Policy", "Responsible Use"] },
              ].map(col => (
                <div key={col.label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>{col.label}</div>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.links.map(link => (
                      <li key={link}><a href="#" style={{ color: "#a8b8d8", fontSize: 13, textDecoration: "none" }}>{link}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(59,130,246,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "#6b7fa3", fontSize: 12 }}>© 2026 SportsIntelAI. All rights reserved.</p>
            <p style={{ color: "#6b7fa3", fontSize: 12, maxWidth: 500 }}>
              ⚠️ Responsible Use: All predictions are model probability estimates only. Past model performance does not guarantee future accuracy. For informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
