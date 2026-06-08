import { useState } from "react";

export default function Settings() {
  const [name, setName] = useState("James Kamau");
  const [phone, setPhone] = useState("+254 712 345 678");
  const [pin, setPin] = useState("P051234567X");
  const [notify, setNotify] = useState(true);

  return (
    <div className="page">
      {/* Profile */}
      <div className="card">
        <p className="section-title">Profile</p>
        {[
          { label: "Business name", value: name, set: setName },
          { label: "Phone number",  value: phone, set: setPhone },
          { label: "KRA PIN",       value: pin,   set: setPin },
        ].map((f) => (
          <div key={f.label} className="field-row">
            <label className="field-label">{f.label}</label>
            <input className="field-input" value={f.value} onChange={(e) => f.set(e.target.value)} />
          </div>
        ))}
        <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>Save profile</button>
      </div>

      {/* Subscription */}
      <div className="card">
        <p className="section-title">Subscription</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Current plan</span>
          <span className="badge badge-green">Starter · KES 200/mo</span>
        </div>
        <div className="detail-row">
          <span className="label">Next billing</span>
          <span className="stat">1 July 2026</span>
        </div>
        <div className="btn-row" style={{ marginTop: "1rem" }}>
          {["Business · 500", "Premium · 1K"].map((p) => (
            <button key={p} className="btn-secondary" style={{ flex: 1 }}>Upgrade to {p}</button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <p className="section-title">Notifications</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">VAT filing reminders</span>
          <button
            className={`toggle ${notify ? "on" : ""}`}
            onClick={() => setNotify(!notify)}
            aria-label="Toggle VAT reminders"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <p className="section-title">Account</p>
        <button className="btn-secondary" style={{ width: "100%", marginTop: "0.75rem" }}>
          Sign out
        </button>
        <button className="btn-danger" style={{ width: "100%", marginTop: "0.5rem" }}>
          Delete account
        </button>
      </div>
    </div>
  );
}
