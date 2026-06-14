import { useState, memo } from "react";

const STEPS = [
  {
    color:    "#00c896",
    bgColor:  "rgba(0,200,150,0.08)",
    icon: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="40" r="36" fill="rgba(0,200,150,0.12)" stroke="rgba(0,200,150,0.3)" strokeWidth="1"/>
        <rect x="22" y="26" width="36" height="28" rx="4" stroke="#00c896" strokeWidth="2"/>
        <circle cx="40" cy="40" r="7" stroke="#00c896" strokeWidth="2"/>
        <circle cx="40" cy="40" r="3" fill="#00c896"/>
        <line x1="40" y1="26" x2="40" y2="31" stroke="#00c896" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="30" x2="28" y2="30" stroke="#00c896" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Scan any receipt instantly",
    desc:  "Point your camera at a receipt or invoice. Our AI reads everything — name, amount, VAT, KRA PIN — and fills in all fields automatically in seconds.",
    tip:   "Works best with clear, well-lit photos",
  },
  {
    color:   "#4f9cf9",
    bgColor: "rgba(79,156,249,0.08)",
    icon: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="40" r="36" fill="rgba(79,156,249,0.12)" stroke="rgba(79,156,249,0.3)" strokeWidth="1"/>
        <rect x="20" y="22" width="40" height="36" rx="4" stroke="#4f9cf9" strokeWidth="2"/>
        <line x1="28" y1="33" x2="52" y2="33" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round"/>
        <line x1="28" y1="40" x2="52" y2="40" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round"/>
        <line x1="28" y1="47" x2="40" y2="47" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="50" cy="50" r="8" fill="#0d1117" stroke="#4f9cf9" strokeWidth="1.5"/>
        <line x1="47" y1="50" x2="53" y2="50" stroke="#4f9cf9" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="50" y1="47" x2="50" y2="53" stroke="#4f9cf9" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Track every transaction",
    desc:  "All your sales, purchases, banking and expenses in one place. Tap ETR on any sale to view a formatted receipt. Search, filter and delete with ease.",
    tip:   "Tap + Add in Books to log manually",
  },
  {
    color:   "#f0a500",
    bgColor: "rgba(240,165,0,0.08)",
    icon: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="40" r="36" fill="rgba(240,165,0,0.1)" stroke="rgba(240,165,0,0.3)" strokeWidth="1"/>
        <rect x="20" y="48" width="10" height="14" rx="2" fill="#f0a500" opacity="0.5"/>
        <rect x="35" y="36" width="10" height="26" rx="2" fill="#f0a500" opacity="0.75"/>
        <rect x="50" y="24" width="10" height="38" rx="2" fill="#f0a500"/>
        <polyline points="20,42 35,30 50,20 65,18" stroke="#f0a500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="65" cy="18" r="3" fill="#f0a500"/>
      </svg>
    ),
    title: "See your cash flow daily",
    desc:  "A real-time bar chart shows your cash in vs cash out for the last 7 days. Tap any bar to see the breakdown. Know exactly where your money goes.",
    tip:   "Net cash updates the moment you add a transaction",
  },
  {
    color:   "#a855f7",
    bgColor: "rgba(168,85,247,0.08)",
    icon: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="40" r="36" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.25)" strokeWidth="1"/>
        <rect x="18" y="30" width="44" height="28" rx="4" stroke="#a855f7" strokeWidth="2"/>
        <path d="M26 30V24a14 14 0 0 1 28 0v6" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="40" cy="44" r="5" stroke="#a855f7" strokeWidth="2"/>
        <line x1="40" y1="49" x2="40" y2="53" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Budget & spending control",
    desc:  "Set monthly budgets for each category — rent, purchases, transport, salaries. A live progress bar shows exactly how much you've spent vs your limit.",
    tip:   "Get a warning when you exceed 80% of any budget",
  },
  {
    color:   "#00c896",
    bgColor: "rgba(0,200,150,0.08)",
    icon: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="40" r="36" fill="rgba(0,200,150,0.1)" stroke="rgba(0,200,150,0.25)" strokeWidth="1"/>
        <circle cx="40" cy="32" r="10" stroke="#00c896" strokeWidth="2"/>
        <path d="M20 58c0-11 9-18 20-18s20 7 20 18" stroke="#00c896" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="58" cy="32" r="6" fill="#0d1117" stroke="#00c896" strokeWidth="1.5"/>
        <line x1="55" y1="32" x2="61" y2="32" stroke="#00c896" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="58" y1="29" x2="58" y2="35" stroke="#00c896" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Manage clients & reports",
    desc:  "Add clients with their KRA PINs and contact details. The Reports tab shows your real VAT summary, links to iTax and eTIMS, and lets you export books as CSV.",
    tip:   "VAT return is due by the 20th of each month",
  },
  {
    color:   "#4f9cf9",
    bgColor: "rgba(79,156,249,0.08)",
    icon: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="40" r="36" fill="rgba(79,156,249,0.1)" stroke="rgba(79,156,249,0.25)" strokeWidth="1"/>
        <path d="M28 40l8 8 16-16" stroke="#4f9cf9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="40" r="18" stroke="#4f9cf9" strokeWidth="1.5" strokeDasharray="4 3"/>
      </svg>
    ),
    title: "You're all set!",
    desc:  "BizBook works offline and syncs automatically. Your data is secure on Firebase. Start by scanning your first receipt or adding a transaction manually.",
    tip:   "Tip: tap the green Scan button anytime to capture a receipt",
  },
];

const Step = memo(({ step, index, total }) => (
  <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
    {/* Icon */}
    <div style={{
      width: "100px", height: "100px",
      borderRadius: "28px",
      background: step.bgColor,
      border: `1px solid ${step.color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 1.5rem",
    }}>
      {step.icon}
    </div>

    {/* Step counter */}
    <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {index + 1} of {total}
    </p>

    {/* Title */}
    <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem", lineHeight: 1.3 }}>
      {step.title}
    </p>

    {/* Description */}
    <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.8, marginBottom: "1.25rem" }}>
      {step.desc}
    </p>

    {/* Tip pill */}
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: step.bgColor,
      border: `0.5px solid ${step.color}40`,
      borderRadius: "20px",
      padding: "6px 14px",
    }}>
      <span style={{ fontSize: "12px", color: step.color, fontWeight: 500 }}>💡 {step.tip}</span>
    </div>
  </div>
));

export default function Onboarding({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const step   = STEPS[current];
  const isLast = current === STEPS.length - 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Logo */}
        <p style={{ textAlign: "center", fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: "var(--accent)", marginBottom: "2rem" }}>
          Biz<span style={{ color: "var(--text)" }}>Book</span>
        </p>

        {/* Card */}
        <div className="card" style={{ padding: "2rem 1.5rem" }}>
          <Step step={step} index={current} total={STEPS.length} />

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "1.5rem 0 1.75rem" }}>
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width:        i === current ? "24px" : "8px",
                  height:       "8px",
                  borderRadius: "4px",
                  background:   i === current ? step.color : "var(--surface2)",
                  border:       "none",
                  cursor:       "pointer",
                  padding:      0,
                  transition:   "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="btn-row">
            {current > 0 ? (
              <button className="btn-secondary" onClick={() => setCurrent(c => c - 1)}>
                ← Back
              </button>
            ) : (
              <button className="btn-secondary" onClick={onFinish}>
                Skip
              </button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 1, background: step.color }}
              onClick={() => isLast ? onFinish() : setCurrent(c => c + 1)}
            >
              {isLast ? "Get started →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
