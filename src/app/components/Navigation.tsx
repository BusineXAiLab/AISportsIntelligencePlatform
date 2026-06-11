import { useState } from "react";
import {
  LayoutDashboard, Zap, FileText, Star, BarChart2,
  CreditCard, User, Send, Settings, Menu, X, ChevronRight,
  Activity, Trophy, Shuffle, Radio, Building2, Gamepad2,
  Code, Share2, ShoppingBag, Globe
} from "lucide-react";

export type Page =
  | "landing" | "pricing" | "login" | "register" | "dashboard"
  | "match-detail" | "reports" | "accuracy" | "watchlist"
  | "telegram" | "billing" | "admin"
  | "leaderboard" | "parlay" | "live" | "b2b" | "fantasy"
  | "api" | "referral" | "marketplace" | "multisport";

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isLoggedIn: boolean;
}

const sidebarGroups = [
  {
    label: "Core",
    items: [
      { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
      { id: "live" as Page, label: "Live Feed", icon: Radio, badge: "LIVE" },
      { id: "match-detail" as Page, label: "Matches", icon: Activity },
      { id: "reports" as Page, label: "Reports", icon: FileText },
      { id: "accuracy" as Page, label: "Accuracy", icon: BarChart2 },
    ],
  },
  {
    label: "Features",
    items: [
      { id: "multisport" as Page, label: "Multi-Sport", icon: Globe },
      { id: "parlay" as Page, label: "Combo Builder", icon: Shuffle },
      { id: "marketplace" as Page, label: "Marketplace", icon: ShoppingBag },
      { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy },
      { id: "fantasy" as Page, label: "Fantasy", icon: Gamepad2 },
    ],
  },
  {
    label: "My Account",
    items: [
      { id: "watchlist" as Page, label: "Watchlist", icon: Star },
      { id: "telegram" as Page, label: "Telegram", icon: Send },
      { id: "referral" as Page, label: "Referrals", icon: Share2 },
      { id: "billing" as Page, label: "Billing", icon: CreditCard },
    ],
  },
  {
    label: "Developer",
    items: [
      { id: "api" as Page, label: "API Access", icon: Code },
      { id: "b2b" as Page, label: "B2B License", icon: Building2 },
      { id: "admin" as Page, label: "Admin", icon: Settings },
    ],
  },
];

export function TopNav({ currentPage, onNavigate, isLoggedIn }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        background: "rgba(8,12,24,0.95)",
        borderBottom: "1px solid rgba(59,130,246,0.15)",
        backdropFilter: "blur(20px)",
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 shrink-0"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #10b981)" }}
          >
            <Zap size={16} color="#fff" />
          </div>
          <span
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: "0.05em", color: "#f0f4ff" }}
            className="text-lg hidden sm:block"
          >
            SPORTSINTEL<span style={{ color: "#3b82f6" }}>AI</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {!isLoggedIn ? (
            <>
              <button onClick={() => onNavigate("b2b")} className="nav-link">B2B</button>
              <button onClick={() => onNavigate("pricing")} className="nav-link">Pricing</button>
              <button onClick={() => onNavigate("login")} className="nav-link">Login</button>
              <button
                onClick={() => onNavigate("register")}
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: "8px", padding: "8px 20px" }}
                className="text-sm font-medium"
              >
                Start Free
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate("live")} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} /> Live
              </button>
              <button onClick={() => onNavigate("multisport")} className="nav-link">Sports</button>
              <button onClick={() => onNavigate("marketplace")} className="nav-link">Marketplace</button>
              <button onClick={() => onNavigate("leaderboard")} className="nav-link">Leaderboard</button>
              <button onClick={() => onNavigate("api")} className="nav-link">API</button>
              <button onClick={() => onNavigate("billing")} style={{ display: "flex", alignItems: "center", gap: "6px" }} className="nav-link">
                <User size={16} /> Account
              </button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ background: "#0d1327", borderBottom: "1px solid rgba(59,130,246,0.15)" }} className="md:hidden px-4 py-4 flex flex-col gap-2">
          {sidebarGroups.flatMap(g => g.items).map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className="mobile-nav-item flex items-center gap-3"
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .nav-link { color: #a8b8d8; font-size: 14px; font-weight: 500; transition: color 0.2s; background: none; border: none; cursor: pointer; }
        .nav-link:hover { color: #f0f4ff; }
        .nav-link-active { color: #3b82f6 !important; }
        .mobile-nav-item { color: #a8b8d8; padding: 10px 12px; border-radius: 8px; text-align: left; font-size: 15px; background: none; border: none; cursor: pointer; width: 100%; }
        .mobile-nav-item:hover { background: rgba(59,130,246,0.1); color: #f0f4ff; }
      `}</style>
    </nav>
  );
}

export function Sidebar({ currentPage, onNavigate }: { currentPage: Page; onNavigate: (p: Page) => void }) {
  return (
    <aside
      style={{
        background: "#080c18",
        borderRight: "1px solid rgba(59,130,246,0.12)",
        width: "220px",
        minHeight: "100vh",
        padding: "80px 10px 80px",
        position: "fixed",
        left: 0, top: 0, bottom: 0,
        zIndex: 40,
        overflowY: "auto",
      }}
      className="hidden lg:flex flex-col gap-4"
    >
      {sidebarGroups.map(group => (
        <div key={group.label}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 6 }}>
            {group.label}
          </div>
          {group.items.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 9,
                  color: active ? "#3b82f6" : "#6b7fa3",
                  background: active ? "rgba(59,130,246,0.1)" : "transparent",
                  fontWeight: active ? 600 : 400, fontSize: 13,
                  transition: "all 0.15s", width: "100%", textAlign: "left",
                  borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                  marginBottom: 1,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#a8b8d8"; e.currentTarget.style.background = "rgba(59,130,246,0.04)"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#6b7fa3"; e.currentTarget.style.background = "transparent"; } }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {"badge" in item && item.badge && (
                  <span style={{ background: "#ef4444", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 8, fontWeight: 800 }}>{item.badge}</span>
                )}
                {active && <ChevronRight size={12} />}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

export function BottomNav({ currentPage, onNavigate }: { currentPage: Page; onNavigate: (p: Page) => void }) {
  const items = [
    { id: "dashboard" as Page, label: "Today", icon: LayoutDashboard },
    { id: "live" as Page, label: "Live", icon: Radio },
    { id: "multisport" as Page, label: "Sports", icon: Globe },
    { id: "marketplace" as Page, label: "Market", icon: ShoppingBag },
    { id: "billing" as Page, label: "Account", icon: User },
  ];
  return (
    <nav
      style={{
        background: "rgba(8,12,24,0.97)",
        borderTop: "1px solid rgba(59,130,246,0.15)",
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
      }}
      className="lg:hidden flex"
    >
      {items.map(item => {
        const active = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              flex: 1, padding: "10px 0",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              color: active ? "#3b82f6" : "#6b7fa3",
              fontSize: "10px", fontWeight: active ? 600 : 400,
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
