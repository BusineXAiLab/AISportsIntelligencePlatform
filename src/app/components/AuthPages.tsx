import { useState } from "react";
import { Eye, EyeOff, Zap, Shield, Mail, Lock, User, ArrowLeft } from "lucide-react";

type Page = "login" | "register" | "dashboard" | "pricing" | "landing" | "match-detail" | "reports" | "accuracy" | "watchlist" | "telegram" | "billing" | "admin";
type AuthMode = "login" | "register" | "forgot" | "verify";

interface Props {
  mode: "login" | "register";
  onNavigate: (page: Page) => void;
  onLogin: () => void;
}

function InputField({
  label, type = "text", placeholder, icon: Icon,
  value, onChange,
}: {
  label: string; type?: string; placeholder: string;
  icon?: React.ElementType; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#a8b8d8", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <Icon size={16} color="#6b7fa3" />
          </div>
        )}
        <input
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: "100%", background: "#131d3a",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 10, padding: `12px ${isPassword ? "44px" : "14px"} 12px ${Icon ? "42px" : "14px"}`,
            color: "#f0f4ff", fontSize: 14,
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
          >
            {show ? <EyeOff size={16} color="#6b7fa3" /> : <Eye size={16} color="#6b7fa3" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthPage({ mode: initialMode, onNavigate, onLogin }: Props) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", remember: false, terms: false });

  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  if (authMode === "verify") {
    return (
      <div style={containerStyle}>
        <AuthCard>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Mail size={28} color="#10b981" />
            </div>
            <h2 style={headingStyle}>Check Your Email</h2>
            <p style={{ color: "#6b7fa3", fontSize: 14, marginTop: 8 }}>
              We've sent a verification link to <strong style={{ color: "#a8b8d8" }}>{form.email || "your email"}</strong>
            </p>
          </div>
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ color: "#a8b8d8", fontSize: 13, lineHeight: 1.6, textAlign: "center" }}>
              Click the link in the email to activate your account. Check spam if you don't see it within 2 minutes.
            </p>
          </div>
          <button
            onClick={() => onLogin()}
            style={{ ...primaryBtnStyle, width: "100%" }}
          >
            Continue to Dashboard
          </button>
          <button onClick={() => setAuthMode("login")} style={{ ...ghostBtnStyle, width: "100%", marginTop: 12 }}>
            <ArrowLeft size={14} /> Back to Login
          </button>
        </AuthCard>
      </div>
    );
  }

  if (authMode === "forgot") {
    return (
      <div style={containerStyle}>
        <AuthCard>
          <button onClick={() => setAuthMode("login")} style={{ ...ghostBtnStyle, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 style={headingStyle}>Reset Password</h2>
          <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 28 }}>Enter your email and we'll send a reset link.</p>
          <InputField label="Email Address" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set("email")} />
          <button style={{ ...primaryBtnStyle, width: "100%", marginTop: 8 }}>Send Reset Link</button>
        </AuthCard>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <AuthCard>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "0.04em" }}>
              SPORTSINTEL<span style={{ color: "#3b82f6" }}>AI</span>
            </span>
          </div>
          <h2 style={headingStyle}>{authMode === "login" ? "Welcome Back" : "Create Your Account"}</h2>
          <p style={{ color: "#6b7fa3", fontSize: 14, marginTop: 6 }}>
            {authMode === "login" ? "Access your football intelligence dashboard" : "Start with free predictions today"}
          </p>
        </div>

        {/* Social login */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {["Google", "Apple"].map(provider => (
            <button
              key={provider}
              style={{
                flex: 1, background: "#131d3a",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 10, padding: "11px",
                color: "#a8b8d8", fontSize: 13, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Shield size={15} /> {provider}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.15)" }} />
          <span style={{ color: "#6b7fa3", fontSize: 12 }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.15)" }} />
        </div>

        {authMode === "register" && (
          <InputField label="Full Name" placeholder="John Smith" icon={User} value={form.name} onChange={set("name")} />
        )}
        <InputField label="Email Address" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set("email")} />
        <InputField label="Password" type="password" placeholder="••••••••" icon={Lock} value={form.password} onChange={set("password")} />
        {authMode === "register" && (
          <InputField label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} value={form.confirm} onChange={set("confirm")} />
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.remember}
              onChange={e => set("remember")(e.target.checked)}
              style={{ accentColor: "#3b82f6" }}
            />
            <span style={{ fontSize: 13, color: "#a8b8d8" }}>Remember me</span>
          </label>
          {authMode === "login" && (
            <button onClick={() => setAuthMode("forgot")} style={{ color: "#3b82f6", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
              Forgot password?
            </button>
          )}
        </div>

        {authMode === "register" && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.terms}
              onChange={e => set("terms")(e.target.checked)}
              style={{ accentColor: "#3b82f6", marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "#6b7fa3", lineHeight: 1.5 }}>
              I agree to the <a href="#" style={{ color: "#3b82f6", textDecoration: "none" }}>Terms of Service</a> and{" "}
              <a href="#" style={{ color: "#3b82f6", textDecoration: "none" }}>Privacy Policy</a>. I confirm this platform is for informational use only.
            </span>
          </label>
        )}

        <button
          onClick={() => {
            if (authMode === "register") { setAuthMode("verify"); }
            else { onLogin(); }
          }}
          style={{ ...primaryBtnStyle, width: "100%" }}
        >
          {authMode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, color: "#6b7fa3", fontSize: 13 }}>
          {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            {authMode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </AuthCard>
    </div>
  );
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#0d1327",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 20, padding: "40px 36px",
        width: "100%", maxWidth: 440,
        boxShadow: "0 0 80px rgba(59,130,246,0.08)",
      }}
    >
      {children}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: "#080c18",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800, fontSize: 28,
  color: "#f0f4ff", letterSpacing: "-0.01em",
};

const primaryBtnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff", borderRadius: 12, padding: "14px 24px",
  fontSize: 15, fontWeight: 700,
  boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
  border: "none", cursor: "pointer",
};

const ghostBtnStyle: React.CSSProperties = {
  background: "none", border: "1px solid rgba(59,130,246,0.2)",
  color: "#a8b8d8", borderRadius: 10, padding: "10px 16px",
  fontSize: 13, cursor: "pointer",
};
