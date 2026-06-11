import { useState } from "react";
import { TopNav, Sidebar, BottomNav } from "./components/Navigation";
import type { Page } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { PricingPage } from "./components/PricingPage";
import { AuthPage } from "./components/AuthPages";
import { Dashboard } from "./components/Dashboard";
import { MatchDetail } from "./components/MatchDetail";
import { ReportsPage } from "./components/ReportsPage";
import { AccuracyPage } from "./components/AccuracyPage";
import { WatchlistPage } from "./components/WatchlistPage";
import { TelegramPage } from "./components/TelegramPage";
import { BillingPage } from "./components/BillingPage";
import { AdminPortal } from "./components/AdminPortal";
import { TipsterLeaderboard } from "./components/TipsterLeaderboard";
import { ParlayBuilder } from "./components/ParlayBuilder";
import { LiveFeed } from "./components/LiveFeed";
import { B2BPage } from "./components/B2BPage";
import { FantasyPage } from "./components/FantasyPage";
import { APIPage } from "./components/APIPage";
import { ReferralPage } from "./components/ReferralPage";
import { MarketplacePage } from "./components/MarketplacePage";
import { MultiSportPage } from "./components/MultiSportPage";

{/* MARKER-MAKE-KIT-INVOKED */}

const PUBLIC_PAGES: Page[] = ["landing", "pricing", "login", "register", "b2b"];
const AUTH_PAGES: Page[] = ["login", "register"];
const STANDALONE_PAGES: Page[] = ["admin"];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("dashboard");
  };

  const isPublic = PUBLIC_PAGES.includes(currentPage);
  const isAuth = AUTH_PAGES.includes(currentPage);
  const isStandalone = STANDALONE_PAGES.includes(currentPage);
  const showTopNav = !isAuth && !isStandalone;
  const showDashboardNav = isLoggedIn && !isPublic && !isStandalone;

  return (
    <div style={{ background: "#080c18", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {showTopNav && (
        <TopNav currentPage={currentPage} onNavigate={navigate} isLoggedIn={isLoggedIn} />
      )}
      {showDashboardNav && (
        <Sidebar currentPage={currentPage} onNavigate={navigate} />
      )}

      <div
        style={{
          paddingTop: showTopNav ? 64 : 0,
          paddingLeft: showDashboardNav ? 220 : 0,
          paddingBottom: showDashboardNav ? 72 : 0,
          minHeight: "100vh",
        }}
      >
        {/* Standalone pages */}
        {isStandalone && currentPage === "admin" && <AdminPortal />}

        {/* Auth */}
        {!isLoggedIn && currentPage === "login" && <AuthPage mode="login" onNavigate={navigate} onLogin={handleLogin} />}
        {!isLoggedIn && currentPage === "register" && <AuthPage mode="register" onNavigate={navigate} onLogin={handleLogin} />}

        {/* Public */}
        {currentPage === "landing" && <LandingPage onNavigate={navigate} />}
        {currentPage === "pricing" && <PricingPage onNavigate={navigate} />}
        {currentPage === "b2b" && <B2BPage />}

        {/* Authenticated — core */}
        {isLoggedIn && currentPage === "dashboard" && <Dashboard onNavigate={navigate} />}
        {isLoggedIn && currentPage === "match-detail" && <MatchDetail onNavigate={navigate} />}
        {isLoggedIn && currentPage === "reports" && <ReportsPage onNavigate={navigate} />}
        {isLoggedIn && currentPage === "accuracy" && <AccuracyPage />}
        {isLoggedIn && currentPage === "watchlist" && <WatchlistPage onNavigate={navigate} />}
        {isLoggedIn && currentPage === "telegram" && <TelegramPage />}
        {isLoggedIn && currentPage === "billing" && <BillingPage onNavigate={navigate} />}

        {/* Authenticated — new features */}
        {isLoggedIn && currentPage === "live" && <LiveFeed />}
        {isLoggedIn && currentPage === "leaderboard" && <TipsterLeaderboard />}
        {isLoggedIn && currentPage === "parlay" && <ParlayBuilder />}
        {isLoggedIn && currentPage === "fantasy" && <FantasyPage />}
        {isLoggedIn && currentPage === "api" && <APIPage />}
        {isLoggedIn && currentPage === "referral" && <ReferralPage />}
        {isLoggedIn && currentPage === "marketplace" && <MarketplacePage />}
        {isLoggedIn && currentPage === "multisport" && <MultiSportPage />}

        {/* Redirect if unauthenticated */}
        {!isLoggedIn && !PUBLIC_PAGES.includes(currentPage) && !isStandalone && !isAuth && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 20 }}>
            <p style={{ color: "#6b7fa3", fontSize: 16 }}>Please sign in to access this page.</p>
            <button onClick={() => navigate("login")} style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>
              Sign In
            </button>
          </div>
        )}
      </div>

      {showDashboardNav && (
        <BottomNav currentPage={currentPage} onNavigate={navigate} />
      )}

      {/* Demo navigation panel */}
      {currentPage === "landing" && (
        <DemoPanel onNavigate={navigate} setLoggedIn={setIsLoggedIn} />
      )}
    </div>
  );
}

function DemoPanel({ onNavigate, setLoggedIn }: { onNavigate: (p: Page) => void; setLoggedIn: (v: boolean) => void }) {
  const [open, setOpen] = useState(true);

  const go = (page: Page) => { setLoggedIn(true); onNavigate(page); };

  const groups = [
    {
      label: "Core Platform",
      color: "#3b82f6",
      items: [
        { label: "Dashboard", page: "dashboard" as Page },
        { label: "Match Detail", page: "match-detail" as Page },
        { label: "AI Reports", page: "reports" as Page },
        { label: "Accuracy Tracker", page: "accuracy" as Page },
      ],
    },
    {
      label: "New Features",
      color: "#10b981",
      items: [
        { label: "🔴 Live Feed", page: "live" as Page },
        { label: "🏆 Leaderboard", page: "leaderboard" as Page },
        { label: "⚡ Combo Builder", page: "parlay" as Page },
        { label: "🌍 Multi-Sport", page: "multisport" as Page },
        { label: "🏀 Fantasy Sports", page: "fantasy" as Page },
        { label: "🛒 Marketplace", page: "marketplace" as Page },
        { label: "💰 Referral Engine", page: "referral" as Page },
        { label: "⚙️ API Access", page: "api" as Page },
        { label: "🏢 B2B License", page: "b2b" as Page },
        { label: "🔧 Admin Portal", page: "admin" as Page },
      ],
    },
  ];

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 200, maxWidth: 260 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #10b981)", color: "#fff", borderRadius: open ? "12px 12px 0 0" : 12, padding: "10px 16px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span>Demo Navigation</span>
        <span style={{ fontSize: 10 }}>{open ? "▼" : "▲"}</span>
      </button>
      {open && (
        <div style={{ background: "#0d1327", border: "1px solid rgba(59,130,246,0.25)", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "12px", maxHeight: 420, overflowY: "auto" }}>
          {groups.map(group => (
            <div key={group.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{group.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.items.map(({ label, page }) => (
                  <button
                    key={page}
                    onClick={() => page === "b2b" || page === "admin" ? onNavigate(page) : go(page)}
                    style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.12)", color: "#a8b8d8", borderRadius: 7, padding: "6px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.2)"; e.currentTarget.style.color = "#f0f4ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.07)"; e.currentTarget.style.color = "#a8b8d8"; }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
