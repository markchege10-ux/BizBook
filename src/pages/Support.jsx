import { useState } from "react";

const FAQS = [
  { q: "How do I scan a receipt?", a: "Go to the Scan tab, tap the camera button, and point at your receipt. AI will extract all fields automatically. You can also choose from gallery or enter details manually." },
  { q: "How does the AI scanner work?", a: "Our AI reads your receipt image and extracts: supplier/customer name, receipt number, date, amount, VAT, KRA PIN, payment method and product category automatically." },
  { q: "How is VAT calculated?", a: "VAT is calculated at 16%. Output VAT comes from your sales, input VAT from purchases. The difference is what you owe KRA. This is shown in your Reports page." },
  { q: "Can I use the app offline?", a: "Yes! BizBook works offline. Your data is cached on your device and syncs automatically when you reconnect to the internet." },
  { q: "How do I file my VAT return?", a: "Go to Reports → click 'Open iTax' to file directly on the KRA portal. Your VAT summary with output and input VAT is ready to copy." },
  { q: "Can an accountant access my books?", a: "Yes. Go to Settings → Accountant Access and share your access code with your accountant. They can view your books without editing them." },
  { q: "How do I export my data?", a: "Go to Reports → scroll to Export Reports. You can download Sales log, Purchase log or Full books as CSV files." },
  { q: "What is the receipt marketplace?", a: "The marketplace lets you upload receipts as verified digital assets for proof of purchase, supplier verification, credit assessment and procurement records." },
];

export default function Support() {
  const [openFaq,  setOpenFaq]  = useState(null);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [message,  setMessage]  = useState("");
  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);

  function handleSend(e) {
    e.preventDefault();
    setSending(true);
    // Simulate sending — in production connect to email service
    setTimeout(() => { setSent(true); setSending(false); }, 1200);
  }

  return (
    <div className="page">
      {/* Contact cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[
          { icon: "📧", label: "Email us",    value: "support@bizbook.co.ke",    action: () => window.open("mailto:support@bizbook.co.ke") },
          { icon: "💬", label: "WhatsApp",    value: "+254 700 000 000",          action: () => window.open("https://wa.me/254700000000") },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: "1rem", cursor: "pointer", textAlign: "center" }} onClick={c.action}>
            <p style={{ fontSize: "28px" }}>{c.icon}</p>
            <p style={{ fontWeight: 600, fontSize: "13px", marginTop: "6px" }}>{c.label}</p>
            <p className="label" style={{ marginTop: "2px", fontSize: "10px" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: "0.75rem" }}>Frequently asked questions</p>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "0.5px solid var(--border)" : "none" }}>
            <button
              style={{ width: "100%", textAlign: "left", padding: "0.85rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontSize: "13px", fontWeight: 500 }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {faq.q}
              <span style={{ color: "var(--accent)", fontSize: "18px", flexShrink: 0, marginLeft: "8px" }}>{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && (
              <p style={{ fontSize: "13px", color: "var(--muted)", paddingBottom: "0.85rem", lineHeight: 1.6 }}>{faq.a}</p>
            )}
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: "1rem" }}>Send us a message</p>
        {sent ? (
          <div className="auth-success">✅ Message sent! We'll get back to you within 24 hours.</div>
        ) : (
          <form onSubmit={handleSend}>
            {[
              { label: "Your name",    key: "name",    type: "text",  val: name,    set: setName,    placeholder: "James Kamau" },
              { label: "Email",        key: "email",   type: "email", val: email,   set: setEmail,   placeholder: "you@example.com" },
            ].map(f => (
              <div key={f.key} className="field-row">
                <label className="field-label">{f.label}</label>
                <input className="field-input" type={f.type} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} required />
              </div>
            ))}
            <div className="field-row">
              <label className="field-label">Message</label>
              <textarea
                className="field-input"
                placeholder="Describe your issue or question…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                style={{ resize: "vertical" }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>

      {/* Business registration */}
      <div className="card">
        <p className="section-title">Company registration</p>
        <p className="label" style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>
          Need to register your business as an LLC or Company Ltd in Kenya?
        </p>
        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "Business Registration (eCitizen)", url: "https://accounts.ecitizen.go.ke" },
            { label: "KRA PIN Registration (iTax)",      url: "https://itax.kra.go.ke" },
            { label: "VAT Registration (KRA)",           url: "https://itax.kra.go.ke" },
          ].map(l => (
            <div key={l.label} className="txn-item" style={{ cursor: "pointer" }} onClick={() => window.open(l.url, "_blank")}>
              <span className="txn-icon">🔗</span>
              <div className="txn-info"><p className="txn-name">{l.label}</p></div>
              <span className="link-btn">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
