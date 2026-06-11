import { useState } from "react";
import { Building2, CheckCircle2, ChevronRight, Globe, Zap, Shield, BarChart2, Code, Users } from "lucide-react";

const PACKAGES = [
  {
    name: "Starter License",
    price: "$4,999",
    period: "/month",
    color: "#3b82f6",
    border: "rgba(59,130,246,0.35)",
    bg: "rgba(59,130,246,0.08)",
    features: ["Up to 5,000 subscribers", "Football predictions only", "White-label dashboard", "Basic Telegram integration", "Email support", "Monthly reporting"],
    cta: "Request Demo",
  },
  {
    name: "Growth License",
    price: "$14,999",
    period: "/month",
    color: "#10b981",
    border: "rgba(16,185,129,0.4)",
    bg: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,19,39,0.9))",
    highlight: true,
    badge: "MOST POPULAR",
    features: ["Up to 50,000 subscribers", "Multi-sport predictions", "Full white-label platform", "Custom branding & domain", "API access (10M calls/mo)", "Dedicated account manager", "SLA: 99.9% uptime"],
    cta: "Get Pricing",
  },
  {
    name: "Enterprise License",
    price: "Custom",
    period: "",
    color: "#f59e0b",
    border: "rgba(245,158,11,0.4)",
    bg: "rgba(245,158,11,0.06)",
    features: ["Unlimited subscribers", "All sports + custom sports", "Full source code access", "On-premise deployment option", "Custom model training", "Dedicated ML engineers", "Custom SLA + legal"],
    cta: "Talk to Sales",
  },
];

const USE_CASES = [
  { icon: Globe, title: "Sports Media Publishers", desc: "Embed AI predictions into editorial content. Drive subscriptions with data-backed coverage.", clients: "ESPN, Sky Sports, The Athletic" },
  { icon: Users, title: "Fantasy Sports Platforms", desc: "Power lineup recommendations and differential picks with calibrated model signals.", clients: "FPL apps, DraftKings, FanDuel partners" },
  { icon: BarChart2, title: "Betting Media & Affiliates", desc: "Responsible intelligence content for regulated markets. Compliance-first language built-in.", clients: "Regulated operators in UK, EU, AU" },
  { icon: Code, title: "SaaS & Developer Products", desc: "Integrate predictions via REST API. Build custom applications on top of our model.", clients: "Startups, agencies, data labs" },
];

export function B2BPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ company: "", name: "", email: "", size: "", useCase: "", message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff" }}>

      {/* Hero */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center", background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.15) 0%, transparent 70%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#10b981", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28 }}>
          <Building2 size={14} /> B2B White-Label Platform
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(40px, 6vw, 76px)", letterSpacing: "-0.01em", maxWidth: 800, margin: "0 auto 20px", lineHeight: 1.05 }}>
          License the AI Intelligence Engine for Your Platform
        </h1>
        <p style={{ color: "#a8b8d8", fontSize: 18, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          White-label our prediction engine, dashboard, and Telegram integration. Launch your own premium football analytics product in weeks, not years.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(16,185,129,0.25)" }}>
            Request Demo
          </button>
          <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0f4ff", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Download Brochure
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, marginTop: 64, justifyContent: "center", flexWrap: "wrap" }}>
          {[["12", "Active Licensees"], ["4.2M", "End Users Served"], ["99.9%", "Platform Uptime"], ["6 Weeks", "Avg. Time to Launch"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, color: "#10b981", lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 12, color: "#6b7fa3", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section style={{ padding: "64px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 44, textAlign: "center", marginBottom: 48 }}>Who Licenses SportsIntelAI</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {USE_CASES.map(({ icon: Icon, title, desc, clients }) => (
            <div key={title} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "24px 20px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon size={20} color="#10b981" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: "#6b7fa3", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{desc}</p>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>e.g. {clients}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section style={{ padding: "48px 24px", background: "rgba(13,19,39,0.5)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, textAlign: "center", marginBottom: 40 }}>Everything Included</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              ["AI Prediction Engine", "Ensemble models, calibrated probabilities, confidence scoring — all accessible via API or dashboard"],
              ["White-Label Dashboard", "Fully branded subscriber portal — your logo, your colors, your domain"],
              ["Telegram Bot & Channels", "Deploy your own VIP Telegram channel powered by our alert infrastructure"],
              ["Responsible Language Engine", "Built-in compliance layer — all content auto-screened for responsible gambling language"],
              ["Accuracy Reporting", "Real-time model accuracy dashboards for your subscribers and your compliance team"],
              ["Admin Portal", "Full prediction review, report publishing, user management, and analytics for your team"],
            ].map(([title, desc]) => (
              <div key={title as string} style={{ display: "flex", gap: 12 }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: "#6b7fa3", fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 44, textAlign: "center", marginBottom: 12 }}>Licensing Plans</h2>
        <p style={{ color: "#6b7fa3", fontSize: 15, textAlign: "center", marginBottom: 48 }}>Annual contracts. Volume discounts available.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {PACKAGES.map(plan => (
            <div key={plan.name} style={{ background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 20, padding: "32px 28px", position: "relative", boxShadow: plan.highlight ? "0 0 60px rgba(16,185,129,0.1)" : "none" }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #10b981, #059669)", borderRadius: 100, padding: "5px 18px", fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ color: plan.color, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 48, color: "#f0f4ff", lineHeight: 1 }}>{plan.price}</span>
                <span style={{ color: "#6b7fa3", fontSize: 14 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "#a8b8d8" }}>
                    <CheckCircle2 size={14} color={plan.color} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                  </li>
                ))}
              </ul>
              <button style={{ width: "100%", background: plan.highlight ? "linear-gradient(135deg, #10b981, #059669)" : plan.name === "Enterprise License" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.07)", border: !plan.highlight && plan.name !== "Enterprise License" ? "1px solid rgba(255,255,255,0.12)" : "none", color: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section style={{ padding: "64px 24px", background: "rgba(13,19,39,0.6)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, textAlign: "center", marginBottom: 8 }}>Talk to Our B2B Team</h2>
          <p style={{ color: "#6b7fa3", textAlign: "center", marginBottom: 36 }}>We'll set up a demo and custom quote within 24 hours.</p>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <CheckCircle2 size={56} color="#10b981" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>We'll be in touch!</h3>
              <p style={{ color: "#a8b8d8" }}>Expect a response from our B2B team within 24 hours.</p>
            </div>
          ) : (
            <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: "36px 32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[{ label: "Company Name", key: "company", placeholder: "Acme Sports Media" }, { label: "Your Name", key: "name", placeholder: "Jane Smith" }, { label: "Work Email", key: "email", placeholder: "jane@company.com" }].map(f => (
                  <div key={f.key} style={{ gridColumn: f.key === "email" ? "1 / -1" : "auto" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#a8b8d8", marginBottom: 6 }}>{f.label}</label>
                    <input value={form[f.key as keyof typeof form] as string} onChange={set(f.key as keyof typeof form)} placeholder={f.placeholder} style={{ width: "100%", background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "11px 14px", color: "#f0f4ff", fontSize: 14, outline: "none", boxSizing: "border-box" }} onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)")} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#a8b8d8", marginBottom: 6 }}>Subscriber Base Size</label>
                <select value={form.size} onChange={set("size")} style={{ width: "100%", background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "11px 14px", color: form.size ? "#f0f4ff" : "#6b7fa3", fontSize: 14, outline: "none", cursor: "pointer" }}>
                  <option value="">Select range</option>
                  {["Under 5,000", "5,000–50,000", "50,000–500,000", "500,000+"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#a8b8d8", marginBottom: 6 }}>Message (optional)</label>
                <textarea value={form.message} onChange={set("message")} placeholder="Tell us about your platform and goals..." rows={4} style={{ width: "100%", background: "#131d3a", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "11px 14px", color: "#f0f4ff", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)")} />
              </div>
              <button onClick={() => setSubmitted(true)} style={{ width: "100%", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Submit Inquiry →
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
