import { useState } from "react";
import { CheckCircle2, X, Zap } from "lucide-react";

type Page = "login" | "register" | "dashboard" | "pricing" | "landing" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";

interface Props { onNavigate: (page: Page) => void; }

const PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    color: "#6b7fa3",
    borderColor: "rgba(107,127,163,0.25)",
    bg: "#0d1327",
    cta: "Start Free",
    ctaPage: "register" as Page,
    features: [
      { label: "3 daily match predictions", included: true },
      { label: "Public Telegram channel", included: true },
      { label: "Basic match previews", included: true },
      { label: "Model probability overview", included: true },
      { label: "Full confidence scoring", included: false },
      { label: "VIP Telegram alerts", included: false },
      { label: "Daily AI reports", included: false },
      { label: "Accuracy dashboard", included: false },
      { label: "Advanced analytics", included: false },
      { label: "Historical model data", included: false },
    ],
  },
  {
    name: "Premium",
    monthlyPrice: 19.99,
    annualPrice: 15.99,
    color: "#3b82f6",
    borderColor: "rgba(59,130,246,0.5)",
    bg: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.06))",
    highlight: true,
    badge: "MOST POPULAR",
    cta: "Go Premium",
    ctaPage: "register" as Page,
    features: [
      { label: "Full dashboard predictions (14+/day)", included: true },
      { label: "Public Telegram channel", included: true },
      { label: "VIP Telegram alerts", included: true },
      { label: "Daily AI intelligence reports", included: true },
      { label: "Full confidence scoring", included: true },
      { label: "Risk level indicators", included: true },
      { label: "Match detail pages", included: true },
      { label: "Basic accuracy tracking", included: true },
      { label: "Advanced analytics", included: false },
      { label: "Historical model performance", included: false },
    ],
  },
  {
    name: "Elite",
    monthlyPrice: 49.99,
    annualPrice: 39.99,
    color: "#f59e0b",
    borderColor: "rgba(245,158,11,0.4)",
    bg: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(13,19,39,0.9))",
    badge: "ELITE",
    cta: "Join Elite",
    ctaPage: "register" as Page,
    features: [
      { label: "Everything in Premium", included: true },
      { label: "Advanced analytics suite", included: true },
      { label: "Deep match intelligence reports", included: true },
      { label: "Priority model insights", included: true },
      { label: "Full historical model performance", included: true },
      { label: "Player & team intelligence", included: true },
      { label: "Advanced filters & segmentation", included: true },
      { label: "Early access predictions", included: true },
      { label: "Dedicated Telegram alerts", included: true },
      { label: "API access (beta)", included: true },
    ],
  },
];

export function PricingPage({ onNavigate }: Props) {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", paddingTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.01em", marginBottom: 16 }}>
            Intelligence That Pays for Itself
          </h1>
          <p style={{ color: "#a8b8d8", fontSize: 18, marginBottom: 36 }}>
            Start free. Upgrade when you want the full signal.
          </p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, padding: "6px 8px" }}>
            <button
              onClick={() => setAnnual(false)}
              style={{
                padding: "8px 24px", borderRadius: 100, fontSize: 14, fontWeight: 600,
                background: !annual ? "#3b82f6" : "transparent",
                color: !annual ? "#fff" : "#6b7fa3",
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{
                padding: "8px 24px", borderRadius: 100, fontSize: 14, fontWeight: 600,
                background: annual ? "#3b82f6" : "transparent",
                color: annual ? "#fff" : "#6b7fa3",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              Annual
              <span style={{ background: "#10b981", color: "#fff", borderRadius: 100, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                background: plan.bg,
                border: `1px solid ${plan.borderColor}`,
                borderRadius: 20,
                padding: "32px 28px",
                position: "relative",
                boxShadow: plan.highlight ? "0 0 60px rgba(59,130,246,0.12)" : "none",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: plan.name === "Elite" ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #3b82f6, #10b981)",
                    borderRadius: 100, padding: "5px 18px",
                    fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div style={{ color: plan.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                {plan.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 52, color: "#f0f4ff", lineHeight: 1 }}>
                  ${annual ? plan.annualPrice.toFixed(2) : plan.monthlyPrice.toFixed(2)}
                </span>
                {plan.monthlyPrice > 0 && (
                  <span style={{ color: "#6b7fa3", fontSize: 14 }}>/mo</span>
                )}
              </div>
              {annual && plan.monthlyPrice > 0 && (
                <div style={{ fontSize: 12, color: "#10b981", marginBottom: 4 }}>
                  Save ${((plan.monthlyPrice - plan.annualPrice) * 12).toFixed(0)}/year
                </div>
              )}
              <p style={{ color: "#6b7fa3", fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>
                {plan.name === "Free" ? "Get started with basic football intelligence." :
                  plan.name === "Premium" ? "Full access to daily predictions, reports, and VIP alerts." :
                    "Maximum depth for serious analysts and premium users."}
              </p>

              <button
                onClick={() => onNavigate(plan.ctaPage)}
                style={{
                  width: "100%",
                  background: plan.name === "Elite"
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : plan.highlight
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "rgba(255,255,255,0.07)",
                  border: !plan.highlight && plan.name !== "Elite" ? "1px solid rgba(255,255,255,0.12)" : "none",
                  color: "#fff", borderRadius: 12, padding: "14px",
                  fontSize: 15, fontWeight: 700, marginBottom: 28,
                  boxShadow: plan.highlight ? "0 4px 20px rgba(59,130,246,0.3)" : "none",
                }}
              >
                {plan.cta}
              </button>

              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: f.included ? "#a8b8d8" : "#3a4a6a", textDecoration: f.included ? "none" : "line-through" }}>
                    {f.included
                      ? <CheckCircle2 size={15} color={plan.color} style={{ flexShrink: 0, marginTop: 1 }} />
                      : <X size={15} color="#3a4a6a" style={{ flexShrink: 0, marginTop: 1 }} />
                    }
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ / disclaimer */}
        <div style={{ marginTop: 72, textAlign: "center" }}>
          <div
            style={{
              background: "rgba(59,130,246,0.05)",
              border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: 16, padding: "24px 32px",
              display: "flex", alignItems: "flex-start", gap: 16, textAlign: "left",
              maxWidth: 700, margin: "0 auto",
            }}
          >
            <Zap size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Responsible Usage Statement</div>
              <p style={{ color: "#6b7fa3", fontSize: 13, lineHeight: 1.7 }}>
                SportsIntelAI provides probability-based match intelligence for informational purposes only. All predictions represent model probability estimates based on historical data. Past model performance does not guarantee future accuracy. This platform does not endorse or encourage gambling. Always use data responsibly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
