import { useState } from "react";
import { CheckCircle2, CreditCard, Download, ChevronDown, X } from "lucide-react";

type Page = "landing" | "pricing" | "login" | "register" | "dashboard" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";
interface Props { onNavigate: (page: Page) => void; }

const INVOICES = [
  { date: "Jun 1, 2026", amount: "$19.99", status: "Paid", id: "INV-20260601" },
  { date: "May 1, 2026", amount: "$19.99", status: "Paid", id: "INV-20260501" },
  { date: "Apr 1, 2026", amount: "$19.99", status: "Paid", id: "INV-20260401" },
  { date: "Mar 1, 2026", amount: "$19.99", status: "Paid", id: "INV-20260301" },
];

const PLANS = [
  {
    name: "Free", price: 0, color: "#6b7fa3",
    features: ["3 daily predictions", "Basic previews"],
    cta: "Downgrade",
  },
  {
    name: "Premium", price: 19.99, color: "#3b82f6",
    features: ["Full dashboard", "VIP Telegram", "Daily AI reports"],
    cta: "Current Plan", current: true,
  },
  {
    name: "Elite", price: 49.99, color: "#f59e0b",
    features: ["Everything in Premium", "Advanced analytics", "Priority insights"],
    cta: "Upgrade",
  },
];

export function BillingPage({ onNavigate }: Props) {
  const [promoCode, setPromoCode] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, marginBottom: 4 }}>Billing & Subscription</h1>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Manage your subscription, payment, and invoices</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Current plan */}
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(13,19,39,0.9))", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Current Plan</div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, color: "#f0f4ff" }}>Premium</h2>
                <div style={{ fontSize: 24, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#3b82f6", marginBottom: 12 }}>
                  $19.99<span style={{ fontSize: 14, fontWeight: 400, color: "#6b7fa3" }}>/month</span>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13, color: "#a8b8d8" }}>
                    <span style={{ color: "#6b7fa3" }}>Status: </span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>● Active</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#a8b8d8" }}>
                    <span style={{ color: "#6b7fa3" }}>Renews: </span>Jul 1, 2026
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCancel(true)}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Plan comparison */}
          <div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Switch Plan</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {PLANS.map(plan => (
                <div
                  key={plan.name}
                  style={{
                    background: plan.current ? `rgba(59,130,246,0.08)` : "#0d1327",
                    border: `1px solid ${plan.current ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.12)"}`,
                    borderRadius: 14, padding: "20px",
                  }}
                >
                  <div style={{ color: plan.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: "#f0f4ff", marginBottom: 14 }}>
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                    {plan.price > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "#6b7fa3" }}>/mo</span>}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#a8b8d8" }}>
                        <CheckCircle2 size={12} color={plan.color} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onNavigate("pricing")}
                    disabled={plan.current}
                    style={{
                      width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: plan.current ? "rgba(59,130,246,0.15)" : plan.name === "Elite" ? "linear-gradient(135deg, #f59e0b, #d97706)" : plan.name === "Free" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                      border: plan.current ? "1px solid rgba(59,130,246,0.3)" : "none",
                      color: plan.current ? "#3b82f6" : "#fff",
                      cursor: plan.current ? "default" : "pointer",
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Payment Method</h3>
              <button style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Update</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(59,130,246,0.06)", borderRadius: 12, padding: "14px 18px" }}>
              <CreditCard size={24} color="#3b82f6" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Visa ending in 4242</div>
                <div style={{ fontSize: 12, color: "#6b7fa3" }}>Expires 08/2027</div>
              </div>
              <div style={{ marginLeft: "auto", background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Default</div>
            </div>
          </div>

          {/* Invoice history */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Invoice History</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(59,130,246,0.04)" }}>
                  {["Date", "Amount", "Invoice ID", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#a8b8d8" }}>{inv.date}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#f0f4ff" }}>{inv.amount}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7fa3" }}>{inv.id}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{inv.status}</span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7fa3" }}>
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Promo code */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Promo Code</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                style={{
                  flex: 1, background: "#131d3a",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10, padding: "10px 14px",
                  color: "#f0f4ff", fontSize: 13, outline: "none",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)")}
              />
              <button style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Apply
              </button>
            </div>
          </div>

          {/* Billing info summary */}
          <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(13,19,39,0.9))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Upgrade to Elite</div>
            <p style={{ color: "#a8b8d8", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Get advanced analytics, historical model performance data, player intelligence, and priority insights for $49.99/month.
            </p>
            <button
              onClick={() => onNavigate("pricing")}
              style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              Upgrade to Elite
            </button>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#0d1327", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26 }}>Cancel Subscription?</h3>
              <button onClick={() => setShowCancel(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#6b7fa3" /></button>
            </div>
            <p style={{ color: "#a8b8d8", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              You'll lose access to VIP Telegram alerts, full match predictions, and daily AI reports on <strong>Jul 1, 2026</strong>. You can resubscribe at any time.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowCancel(false)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f4ff", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Keep Premium
              </button>
              <button style={{ flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 600, cursor: "pointer" }} onClick={() => setShowCancel(false)}>
                Cancel Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
