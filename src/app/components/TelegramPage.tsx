import { useState } from "react";
import { Send, CheckCircle2, Circle, ChevronRight, AlertTriangle, ExternalLink } from "lucide-react";

const STEPS = [
  { id: 1, title: "Connect Telegram Account", desc: "Link your Telegram account to enable VIP alerts." },
  { id: 2, title: "Verify with Bot", desc: "Open the SportsIntelAI bot and send the verification code." },
  { id: 3, title: "Confirm Subscription", desc: "Bot verifies your active Premium/Elite subscription." },
  { id: 4, title: "Join VIP Channel", desc: "Receive your private invite link to the VIP Telegram channel." },
  { id: 5, title: "Manage Alert Preferences", desc: "Customize which alerts you receive and when." },
];

type Status = "not-connected" | "connected" | "premium-active" | "vip-granted" | "expired" | "vip-removed";

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: typeof CheckCircle2;
  desc: string;
}

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  "not-connected": { label: "Not Connected", color: "#6b7fa3", bg: "rgba(107,127,163,0.08)", border: "rgba(107,127,163,0.2)", icon: Circle, desc: "Your Telegram account is not linked yet." },
  "connected": { label: "Connected", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", icon: CheckCircle2, desc: "Telegram account linked. Awaiting subscription confirmation." },
  "premium-active": { label: "Premium Active", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", icon: CheckCircle2, desc: "Active subscription confirmed." },
  "vip-granted": { label: "VIP Access Granted", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2, desc: "You have full VIP Telegram channel access." },
  "expired": { label: "Subscription Expired", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", icon: AlertTriangle, desc: "Your subscription has expired. Renew to restore VIP access." },
  "vip-removed": { label: "VIP Access Removed", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", icon: AlertTriangle, desc: "VIP access removed due to subscription lapse." },
};

export function TelegramPage() {
  const [status, setStatus] = useState<Status>("vip-granted");
  const [currentStep, setCurrentStep] = useState(5);
  const [verifyCode] = useState("SIAI-8X4K2P");

  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40, marginBottom: 4 }}>Telegram Integration</h1>
        <p style={{ color: "#6b7fa3", fontSize: 15 }}>Connect your account to receive VIP match intelligence alerts</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

        {/* Left: Steps */}
        <div>
          {/* Status card */}
          <div
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${cfg.bg}`, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <StatusIcon size={24} color={cfg.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 13, color: "#a8b8d8", marginTop: 2 }}>{cfg.desc}</div>
            </div>
          </div>

          {/* Step progress */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => {
              const done = step.id < currentStep;
              const active = step.id === currentStep;
              return (
                <div
                  key={step.id}
                  style={{ display: "flex", gap: 20, paddingBottom: i < STEPS.length - 1 ? 0 : 0 }}
                >
                  {/* Step indicator */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: done ? "#10b981" : active ? "#3b82f6" : "#131d3a",
                        border: `2px solid ${done ? "#10b981" : active ? "#3b82f6" : "rgba(59,130,246,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700,
                        color: done || active ? "#fff" : "#6b7fa3",
                        flexShrink: 0,
                      }}
                    >
                      {done ? <CheckCircle2 size={18} /> : step.id}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 2, height: 40, background: done ? "#10b981" : "rgba(59,130,246,0.12)", margin: "4px 0" }} />
                    )}
                  </div>

                  {/* Step content */}
                  <div style={{ flex: 1, paddingBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: done ? "#10b981" : active ? "#f0f4ff" : "#6b7fa3" }}>{step.title}</div>
                        <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{step.desc}</div>
                      </div>
                    </div>

                    {/* Step-specific content */}
                    {active && step.id === 1 && (
                      <div style={{ marginTop: 16, background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, padding: 20 }}>
                        <p style={{ color: "#a8b8d8", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                          Click below to open Telegram and connect your account through our official bot.
                        </p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer" }}
                        >
                          <Send size={16} /> Connect Telegram
                        </button>
                      </div>
                    )}

                    {active && step.id === 2 && (
                      <div style={{ marginTop: 16, background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, padding: 20 }}>
                        <p style={{ color: "#a8b8d8", fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                          Open the <strong style={{ color: "#3b82f6" }}>@SportsIntelAI_bot</strong> on Telegram and send this verification code:
                        </p>
                        <div style={{ background: "#080c18", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "14px 20px", fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 16, textAlign: "center" }}>
                          {verifyCode}
                        </div>
                        <button
                          onClick={() => setCurrentStep(3)}
                          style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                        >
                          I've sent the code →
                        </button>
                      </div>
                    )}

                    {active && step.id === 5 && status === "vip-granted" && (
                      <div style={{ marginTop: 16, background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,19,39,0.9))", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: 20 }}>
                        <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700, marginBottom: 12 }}>● VIP Access Active — Alerts Configured</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {["Pre-match alerts (4h before)", "High confidence signals", "Daily brief at 7:00 AM"].map(pref => (
                            <div key={pref} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#a8b8d8" }}>
                              <CheckCircle2 size={14} color="#10b981" /> {pref}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Channel info + status toggle (demo) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>VIP Channel Preview</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px", background: "rgba(59,130,246,0.06)", borderRadius: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>SportsIntelAI VIP</div>
                <div style={{ fontSize: 12, color: "#6b7fa3" }}>4,218 subscribers · Private channel</div>
              </div>
              <ExternalLink size={16} color="#6b7fa3" style={{ marginLeft: "auto" }} />
            </div>

            {/* Mock messages */}
            {[
              { time: "06:02", text: "📊 Daily Brief: 14 matches analyzed. 6 high-confidence signals. Full report →" },
              { time: "15:00", text: "⚡ HIGH CONFIDENCE · Premier League\nManchester City vs Chelsea · 19:45\nModel signal: 58% Home Win · Medium Risk" },
              { time: "15:01", text: "⚡ HIGH CONFIDENCE · Bundesliga\nBayern Munich vs Dortmund · 18:30\nModel signal: 62% Home Win · Low Risk" },
            ].map((msg, i) => (
              <div key={i} style={{ marginBottom: 10, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#6b7fa3", marginBottom: 4 }}>{msg.time}</div>
                <div style={{ fontSize: 12, color: "#a8b8d8", lineHeight: 1.5, whiteSpace: "pre-line" }}>{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Demo status switcher */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
            <h4 style={{ fontWeight: 600, fontSize: 13, color: "#6b7fa3", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Demo: Status States</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.keys(STATUS_CONFIG) as Status[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: status === s ? `${STATUS_CONFIG[s].bg}` : "transparent",
                    border: `1px solid ${status === s ? STATUS_CONFIG[s].border : "rgba(59,130,246,0.1)"}`,
                    color: status === s ? STATUS_CONFIG[s].color : "#6b7fa3",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
