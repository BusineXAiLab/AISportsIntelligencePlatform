import { useState } from "react";
import { Users, Copy, TrendingUp, DollarSign, Share2, CheckCircle2, ChevronRight, Gift } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const MONTHLY_EARNINGS = [
  { month: "Jan", earnings: 48 }, { month: "Feb", earnings: 72 }, { month: "Mar", earnings: 96 },
  { month: "Apr", earnings: 132 }, { month: "May", earnings: 168 }, { month: "Jun", earnings: 204 },
];

const REFERRALS = [
  { name: "J. Smith", email: "j***@gmail.com", plan: "Premium", date: "Jun 3, 2026", status: "Active", commission: "$4.00/mo" },
  { name: "S. Chen", email: "s***@outlook.com", plan: "Elite", date: "May 28, 2026", status: "Active", commission: "$10.00/mo" },
  { name: "M. Hill", email: "m***@yahoo.com", plan: "Premium", date: "May 14, 2026", status: "Active", commission: "$4.00/mo" },
  { name: "L. Ahmed", email: "l***@gmail.com", plan: "Free", date: "Apr 22, 2026", status: "Converted", commission: "$0.00" },
  { name: "T. Brown", email: "t***@hotmail.com", plan: "Premium", date: "Apr 18, 2026", status: "Active", commission: "$4.00/mo" },
];

const TIERS = [
  { name: "Starter Affiliate", minReferrals: 0, rate: "20%", monthly: "$0–$99", color: "#6b7fa3", perks: ["Unique referral link", "Real-time dashboard", "Monthly payouts"] },
  { name: "Silver Affiliate", minReferrals: 10, rate: "25%", monthly: "$100–$499", color: "#a8b8d8", perks: ["Priority link tracking", "Email alerts on conversions", "Quarterly bonus"] },
  { name: "Gold Affiliate", minReferrals: 25, rate: "30%", monthly: "$500–$1,999", color: "#f59e0b", perks: ["Dedicated affiliate manager", "Co-marketing opportunities", "Feature in leaderboard"] },
  { name: "Elite Affiliate", minReferrals: 50, rate: "40%", monthly: "$2,000+", color: "#10b981", perks: ["40% recurring commission", "Revenue share escalators", "Custom landing page", "Priority payouts"] },
];

export function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const refLink = "https://sportsintelai.com/ref/USR-4F2A8K";

  const copy = () => { navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#080c18", minHeight: "100vh", color: "#f0f4ff", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Share2 size={22} color="#10b981" />
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 40 }}>Referral & Affiliate Engine</h1>
          </div>
          <p style={{ color: "#6b7fa3", fontSize: 15 }}>Earn 20–40% recurring commission on every subscriber you refer</p>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(13,19,39,0.9))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 4 }}>Your Current Tier</div>
          <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 16 }}>Gold Affiliate</div>
          <div style={{ fontSize: 12, color: "#10b981" }}>30% recurring</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[["Total Referrals", "17", "#3b82f6"], ["Active Subscribers", "13", "#10b981"], ["Monthly Earnings", "$204", "#f59e0b"], ["Total Earned", "$1,284", "#8b5cf6"], ["Pending Payout", "$204", "#10b981"]].map(([l, v, c]) => (
          <div key={l as string} style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{l}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, color: c as string, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Referral link */}
          <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,19,39,0.95))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>Your Referral Link</h3>
            <p style={{ color: "#6b7fa3", fontSize: 13, marginBottom: 16 }}>Share this link to earn commission on every conversion. Works on Twitter, Telegram, YouTube, anywhere.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, background: "#080c18", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#a8b8d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {refLink}
              </div>
              <button onClick={copy} style={{ background: copied ? "#10b981" : "rgba(16,185,129,0.15)", border: `1px solid ${copied ? "#10b981" : "rgba(16,185,129,0.3)"}`, color: copied ? "#fff" : "#10b981", borderRadius: 10, padding: "12px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />} {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {["Share on Twitter", "Share on Telegram", "Generate QR Code"].map(action => (
                <button key={action} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#a8b8d8", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{action}</button>
              ))}
            </div>
          </div>

          {/* Earnings chart */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20 }}>Monthly Earnings Trend</h3>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: "#10b981" }}>$204/mo</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={MONTHLY_EARNINGS}>
                <XAxis dataKey="month" tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7fa3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#f0f4ff", fontSize: 12 }} formatter={(v: number) => [`$${v}`, "Earnings"]} />
                <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Referrals table */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20 }}>Your Referrals</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(59,130,246,0.05)" }}>
                  {["User", "Plan", "Joined", "Status", "Monthly Commission"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REFERRALS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7fa3" }}>{r.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.plan === "Elite" ? "#f59e0b" : r.plan === "Premium" ? "#3b82f6" : "#6b7fa3" }}>{r.plan}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#a8b8d8" }}>{r.date}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.status === "Active" ? "#10b981" : "#f59e0b" }}>● {r.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#10b981" }}>{r.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: tiers + payout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Affiliate tiers */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Commission Tiers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {TIERS.map(tier => {
                const isActive = tier.name === "Gold Affiliate";
                return (
                  <div key={tier.name} style={{ background: isActive ? `${tier.color}10` : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? `${tier.color}50` : "rgba(59,130,246,0.08)"}`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isActive ? tier.color : "#f0f4ff" }}>{tier.name} {isActive && "← You"}</div>
                        <div style={{ fontSize: 11, color: "#6b7fa3", marginTop: 2 }}>{tier.minReferrals}+ active referrals</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: tier.color }}>{tier.rate}</div>
                        <div style={{ fontSize: 10, color: "#6b7fa3" }}>recurring</div>
                      </div>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      {tier.perks.map(p => (
                        <li key={p} style={{ display: "flex", gap: 6, fontSize: 12, color: "#a8b8d8" }}>
                          <CheckCircle2 size={12} color={tier.color} style={{ flexShrink: 0, marginTop: 1 }} /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payout card */}
          <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(13,19,39,0.9))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <DollarSign size={20} color="#f59e0b" />
              <h4 style={{ fontWeight: 600, fontSize: 15 }}>Payout Summary</h4>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#a8b8d8" }}>Pending this cycle</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#f59e0b", fontWeight: 500 }}>$204.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "#a8b8d8" }}>Next payout</span>
              <span style={{ fontSize: 13, color: "#a8b8d8" }}>Jul 1, 2026</span>
            </div>
            <button style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
              Request Early Payout
            </button>
            <p style={{ fontSize: 11, color: "#6b7fa3", textAlign: "center", marginTop: 10 }}>Via PayPal · Stripe · Crypto (USDC)</p>
          </div>

          {/* Progress to Elite */}
          <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: 20 }}>
            <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Progress to Elite Affiliate</h4>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7fa3", marginBottom: 6 }}>
              <span>Active referrals</span>
              <span>13 / 50</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 100, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: "26%", background: "linear-gradient(90deg, #f59e0b, #10b981)", borderRadius: 100 }} />
            </div>
            <p style={{ fontSize: 12, color: "#6b7fa3" }}>37 more active referrals to unlock Elite tier (40% recurring).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
