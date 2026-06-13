import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/api";

const PLANS = [
  { id: "starter",  label: "Starter",  price: 200,  color: "var(--accent)",  features: ["50 transactions/month", "AI receipt scanner", "Basic reports"] },
  { id: "business", label: "Business", price: 500,  color: "var(--blue)",    features: ["Unlimited transactions", "ETR integration", "VAT reports", "Cash flow timeline", "Budget tracking"] },
  { id: "premium",  label: "Premium",  price: 1000, color: "var(--warn)",    features: ["Everything in Business", "KRA/eTIMS integration", "Receipt marketplace", "Client management", "Priority support"] },
];

const SECTIONS = [
  { id: "profile",      label: "Business Profile",    icon: "🏢" },
  { id: "subscription", label: "Subscription",         icon: "⚡" },
  { id: "appearance",   label: "App Appearance",       icon: "🎨" },
  { id: "notifications",label: "Notifications",        icon: "🔔" },
  { id: "accountant",   label: "Accountant Access",    icon: "👤" },
  { id: "data",         label: "Data & Privacy",       icon: "🔒" },
  { id: "account",      label: "Account",              icon: "⚙️" },
];

export default function Settings() {
  const { user, profile, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");

  // Profile fields
  const [name,     setName]     = useState("");
  const [business, setBusiness] = useState("");
  const [phone,    setPhone]    = useState("");
  const [pin,      setPin]      = useState("");
  const [email2,   setEmail2]   = useState("");
  const [industry, setIndustry] = useState("");
  const [address,  setAddress]  = useState("");

  // App settings
  const [currency,   setCurrency]   = useState("KES");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [vatRate,    setVatRate]    = useState("16");
  const [darkMode,   setDarkMode]   = useState(true);

  // Notifications
  const [notifVAT,    setNotifVAT]    = useState(true);
  const [notifBudget, setNotifBudget] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  // Accountant
  const [accountantEmail, setAccountantEmail] = useState("");
  const [accessCode,      setAccessCode]      = useState("");

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name         ?? "");
      setBusiness(profile.businessName ?? "");
      setPhone(profile.phone       ?? "");
      setPin(profile.kraPin        ?? "");
      setEmail2(profile.altEmail   ?? "");
      setIndustry(profile.industry ?? "");
      setAddress(profile.address   ?? "");
    }
  }, [profile]);

  async function handleSaveProfile() {
    setSaving(true); setError(""); setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        name, businessName: business, phone,
        kraPin: pin, altEmail: email2, industry, address,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  function generateAccessCode() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setAccessCode(code);
  }

  const currentPlan = profile?.plan ?? "starter";

  return (
    <div className="page">
      {/* Section selector */}
      <div className="card" style={{ padding: "0.5rem" }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "0.75rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer",
              background: activeSection === s.id ? "var(--accent-dim)" : "transparent",
              color: activeSection === s.id ? "var(--accent)" : "var(--text)",
              fontWeight: activeSection === s.id ? 600 : 400,
              fontSize: "14px", textAlign: "left",
              transition: "background 0.15s",
            }}
          >
            <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{s.icon}</span>
            {s.label}
            <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "12px" }}>›</span>
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {activeSection === "profile" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>Business Profile</p>
          {error && <div className="auth-error" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}
          {saved && <div className="auth-success" style={{ marginBottom: "1rem" }}>✅ Profile saved!</div>}

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            {user?.photoURL
              ? <img src={user.photoURL} style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} referrerPolicy="no-referrer" alt="avatar" />
              : <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                  {(name || user?.displayName || "U").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                </div>
            }
            <div>
              <p style={{ fontWeight: 600, fontSize: "15px" }}>{name || "Your name"}</p>
              <p className="label">{user?.email}</p>
            </div>
          </div>

          {[
            { label: "Full name *",      value: name,     set: setName,     type: "text",  placeholder: "James Kamau" },
            { label: "Business name *",  value: business, set: setBusiness, type: "text",  placeholder: "Kamau Traders Ltd" },
            { label: "Phone number",     value: phone,    set: setPhone,    type: "tel",   placeholder: "+254 7XX XXX XXX" },
            { label: "KRA PIN",          value: pin,      set: setPin,      type: "text",  placeholder: "P051234567X" },
            { label: "Industry",         value: industry, set: setIndustry, type: "text",  placeholder: "e.g. Retail, Manufacturing" },
            { label: "Business address", value: address,  set: setAddress,  type: "text",  placeholder: "Nairobi, Kenya" },
          ].map((f) => (
            <div key={f.label} className="field-row">
              <label className="field-label">{f.label}</label>
              <input className="field-input" type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)} />
            </div>
          ))}

          <div className="field-row">
            <label className="field-label">Email (login)</label>
            <input className="field-input" type="email" value={user?.email ?? ""} disabled style={{ opacity: 0.5 }} />
          </div>

          <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      )}

      {/* ── SUBSCRIPTION ── */}
      {activeSection === "subscription" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>Subscription Plan</p>
          <p className="label" style={{ marginBottom: "1rem" }}>
            Current plan: <strong style={{ color: "var(--accent)" }}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong>
          </p>
          {PLANS.map((plan) => (
            <div key={plan.id} className="card" style={{
              marginBottom: "10px", padding: "1rem",
              border: currentPlan === plan.id ? `1.5px solid ${plan.color}` : "0.5px solid var(--border2)",
              background: currentPlan === plan.id ? `${plan.color}15` : "var(--surface2)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "15px", color: plan.color }}>{plan.label}</p>
                  <p className="label">KES {plan.price}/month</p>
                </div>
                {currentPlan === plan.id
                  ? <span className="badge badge-green">✓ Active</span>
                  : <button className="btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}>Upgrade</button>
                }
              </div>
              <ul style={{ marginTop: "0.75rem" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "3px", listStyle: "none" }}>✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {activeSection === "appearance" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>App Appearance</p>
          {[
            { label: "Currency",        value: currency,   set: setCurrency,   options: ["KES","USD","EUR","GBP"] },
            { label: "Date format",     value: dateFormat, set: setDateFormat, options: ["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"] },
            { label: "Default VAT rate",value: vatRate,    set: setVatRate,    options: ["16","8","0"] },
          ].map(f => (
            <div key={f.label} className="field-row">
              <label className="field-label">{f.label}</label>
              <select className="field-input" value={f.value} onChange={e => f.set(e.target.value)}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="detail-row" style={{ marginTop: "0.75rem" }}>
            <span className="label">Dark mode</span>
            <button className={`toggle ${darkMode ? "on" : ""}`} onClick={() => setDarkMode(!darkMode)}>
              <span className="toggle-knob" />
            </button>
          </div>
          <button className="btn-primary" style={{ width: "100%", marginTop: "1.25rem" }}>Save appearance</button>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeSection === "notifications" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>Notifications</p>
          {[
            { label: "VAT filing reminders",    sub: "Alert 10 days before due date", val: notifVAT,    set: setNotifVAT },
            { label: "Budget alerts",           sub: "When spending exceeds 80%",      val: notifBudget, set: setNotifBudget },
            { label: "Weekly summary",          sub: "Every Monday morning",          val: notifWeekly, set: setNotifWeekly },
          ].map(n => (
            <div key={n.label} className="detail-row" style={{ padding: "0.85rem 0" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{n.label}</p>
                <p className="label">{n.sub}</p>
              </div>
              <button className={`toggle ${n.val ? "on" : ""}`} onClick={() => n.set(!n.val)}>
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── ACCOUNTANT ACCESS ── */}
      {activeSection === "accountant" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "0.5rem" }}>Accountant Access</p>
          <p className="label" style={{ marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Give your accountant or consultant read-only access to your books. They can view transactions and generate reports but cannot edit your data.
          </p>
          <div className="field-row">
            <label className="field-label">Accountant email</label>
            <input className="field-input" type="email" placeholder="accountant@example.com" value={accountantEmail} onChange={e => setAccountantEmail(e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Access code</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input className="field-input" style={{ flex: 1 }} type="text" value={accessCode} readOnly placeholder="Generate a code" />
              <button className="btn-secondary" onClick={generateAccessCode}>Generate</button>
            </div>
          </div>
          {accessCode && (
            <div className="auth-success" style={{ marginTop: "0.75rem" }}>
              Share this code: <strong>{accessCode}</strong> with your accountant
            </div>
          )}
          <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={!accountantEmail || !accessCode}>
            Send access invite
          </button>
        </div>
      )}

      {/* ── DATA & PRIVACY ── */}
      {activeSection === "data" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>Data & Privacy</p>
          {[
            { label: "Export all my data",   sub: "Download everything as CSV",  icon: "📥", action: () => {} },
            { label: "Privacy policy",        sub: "How we use your data",        icon: "📄", action: () => {} },
            { label: "Terms of service",      sub: "Our terms and conditions",    icon: "📋", action: () => {} },
          ].map(item => (
            <div key={item.label} className="txn-item" style={{ cursor: "pointer" }} onClick={item.action}>
              <span className="txn-icon">{item.icon}</span>
              <div className="txn-info">
                <p className="txn-name">{item.label}</p>
                <p className="txn-meta">{item.sub}</p>
              </div>
              <span className="link-btn">→</span>
            </div>
          ))}
        </div>
      )}

      {/* ── ACCOUNT ── */}
      {activeSection === "account" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>Account</p>
          <div className="detail-row">
            <span className="label">Signed in as</span>
            <span style={{ fontSize: "13px", color: "var(--text)" }}>{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Auth provider</span>
            <span style={{ fontSize: "13px", color: "var(--text)" }}>{profile?.provider ?? "email"}</span>
          </div>
          <div className="detail-row">
            <span className="label">Plan</span>
            <span style={{ fontSize: "13px", color: "var(--accent)" }}>{currentPlan}</span>
          </div>
          <button className="btn-secondary" style={{ width: "100%", marginTop: "1.25rem" }} onClick={logout}>
            Sign out
          </button>
          <button className="btn-danger" style={{ width: "100%", marginTop: "0.5rem" }}>
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}
