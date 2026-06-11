import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/api";

const PLANS = [
  { id: "starter",  label: "Starter",  price: 200,  features: ["Up to 50 transactions/month", "AI receipt scanner", "Basic reports"] },
  { id: "business", label: "Business", price: 500,  features: ["Unlimited transactions", "ETR integration", "VAT reports", "Cash flow timeline"] },
  { id: "premium",  label: "Premium",  price: 1000, features: ["Everything in Business", "KRA/eTIMS integration", "Receipt marketplace", "Priority support"] },
];

export default function Settings() {
  const { user, profile, logout } = useAuth();
  const [name,     setName]     = useState(profile?.name         ?? user?.displayName ?? "");
  const [business, setBusiness] = useState(profile?.businessName ?? "");
  const [phone,    setPhone]    = useState(profile?.phone        ?? "");
  const [pin,      setPin]      = useState(profile?.kraPin       ?? "");
  const [notify,   setNotify]   = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBusiness(profile.businessName ?? "");
      setPhone(profile.phone ?? "");
      setPin(profile.kraPin ?? "");
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true); setError(""); setSaved(false);
    try {
      await updateUserProfile(user.uid, { name, businessName: business, phone, kraPin: pin });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const currentPlan = profile?.plan ?? "starter";

  return (
    <div className="page">
      {/* Profile */}
      <div className="card">
        <p className="section-title">Business profile</p>
        {error   && <div className="auth-error"   style={{ marginTop: "0.75rem" }}>⚠️ {error}</div>}
        {saved   && <div className="auth-success" style={{ marginTop: "0.75rem" }}>✅ Profile saved!</div>}

        {[
          { label: "Full name",       value: name,     set: setName,     type: "text",  placeholder: "James Kamau" },
          { label: "Business name",   value: business, set: setBusiness, type: "text",  placeholder: "Kamau Traders" },
          { label: "Phone number",    value: phone,    set: setPhone,    type: "tel",   placeholder: "+254 7XX XXX XXX" },
          { label: "KRA PIN",         value: pin,      set: setPin,      type: "text",  placeholder: "P051234567X" },
        ].map((f) => (
          <div key={f.label} className="field-row" style={{ marginTop: "0.75rem" }}>
            <label className="field-label">{f.label}</label>
            <input className="field-input" type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)} />
          </div>
        ))}

        <div className="field-row" style={{ marginTop: "0.75rem" }}>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={user?.email ?? ""} disabled style={{ opacity: 0.5 }} />
        </div>

        <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

      {/* Subscription */}
      <div className="card">
        <p className="section-title">Subscription plan</p>
        <p className="label" style={{ marginTop: "0.5rem" }}>Current plan: <strong style={{ color: "var(--accent)" }}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong></p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: "1rem",
                border: currentPlan === plan.id ? "1.5px solid var(--accent)" : "0.5px solid var(--border2)",
                cursor: currentPlan === plan.id ? "default" : "pointer",
                background: currentPlan === plan.id ? "var(--accent-dim)" : "var(--surface2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "14px" }}>{plan.label}</p>
                  <p className="label">KES {plan.price}/month</p>
                </div>
                {currentPlan === plan.id
                  ? <span className="badge badge-green">Current</span>
                  : <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>Upgrade</button>
                }
              </div>
              <ul style={{ marginTop: "0.75rem", paddingLeft: "1rem" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "3px" }}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <p className="section-title">Notifications</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">VAT filing reminders</span>
          <button className={`toggle ${notify ? "on" : ""}`} onClick={() => setNotify(!notify)} aria-label="Toggle VAT reminders">
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <p className="section-title">Account</p>
        <p className="label" style={{ marginTop: "0.5rem" }}>Signed in as {user?.email}</p>
        <button className="btn-danger" style={{ width: "100%", marginTop: "1rem" }} onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
