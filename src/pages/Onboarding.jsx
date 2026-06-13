import { memo, useState } from "react";

const STEPS = [
  {
    icon: "📷",
    title: "Scan receipts instantly",
    desc: "Point your phone camera at any receipt or invoice. Our AI reads it and fills in all the details — name, amount, VAT, KRA PIN — automatically.",
    tip: "Tip: Works best with clear, well-lit receipts.",
  },
  {
    icon: "📊",
    title: "Track sales & purchases",
    desc: "Every transaction is saved to your Books. View all sales (ETR receipts), purchases, banking deposits and expenses in one place.",
    tip: "Tip: Tap ETR on any sale to view the formatted receipt.",
  },
  {
    icon: "💰",
    title: "Set budgets",
    desc: "Create budgets for each spending category — purchases, rent, transport, salaries, utilities. See how much you've spent vs your budget in real time.",
    tip: "Tip: Set monthly budgets to control your cash flow.",
  },
  {
    icon: "📈",
    title: "Get financial reports",
    desc: "See your VAT summary, output vs input VAT, and what you owe KRA. Export sales and purchase logs as CSV files. Links to iTax and eTIMS are built in.",
    tip: "Tip: VAT return is due by the 20th of each month.",
  },
  {
    icon: "👥",
    title: "Manage clients",
    desc: "Add all your clients and suppliers with their KRA PINs and contact details. View company data instantly when you open a client profile.",
    tip: "Tip: Accountants can request access to view your books.",
  },
  {
    icon: "🚀",
    title: "You're ready!",
    desc: "BizBook is set up and ready to use. Start by scanning your first receipt or adding a transaction manually.",
    tip: "Tip: Your data syncs automatically and works offline.",
  },
];

const Step = memo(({ step, index, total }) => (
  <div style={{ textAlign: "center", padding: "1rem 0" }}>
    <div style={{ fontSize: "64px", marginBottom: "1rem" }}>{step.icon}</div>
    <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      Step {index + 1} of {total}
    </p>
    <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text)" }}>{step.title}</p>
    <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.7, marginBottom: "1rem" }}>{step.desc}</p>
    <div style={{ background: "var(--accent-dim)", border: "0.5px solid rgba(0,200,150,0.25)", borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontSize: "12px", color: "var(--accent)" }}>{step.tip}</p>
    </div>
  </div>
));

export default function Onboarding({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const step = STEPS[current];
  const isLast = current === STEPS.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <p style={{ textAlign: "center", fontFamily: "monospace", fontSize: "20px", fontWeight: 700, color: "var(--accent)", marginBottom: "2rem" }}>
          Biz<span style={{ color: "var(--text)" }}>Book</span>
        </p>

        {/* Step content */}
        <div className="card">
          <Step step={step} index={current} total={STEPS.length} />

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", margin: "1.25rem 0" }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === current ? "var(--accent)" : "var(--surface2)", cursor: "pointer", transition: "all 0.3s ease" }} />
            ))}
          </div>

          {/* Buttons */}
          <div className="btn-row">
            {current > 0 && (
              <button className="btn-secondary" onClick={() => setCurrent(c => c - 1)}>← Back</button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => isLast ? onFinish() : setCurrent(c => c + 1)}
            >
              {isLast ? "Get Started 🚀" : "Next →"}
            </button>
          </div>

          {!isLast && (
            <button className="link-btn center" style={{ marginTop: "0.75rem" }} onClick={onFinish}>
              Skip guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
