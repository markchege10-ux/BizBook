import { useState } from "react";

const RECEIPTS = [
  { id: 1, name: "Unga Ltd · INV #203", date: "2026-06-06", amount: 8500, verified: true,  type: "purchase" },
  { id: 2, name: "ETR #4821 · Wanjiku",  date: "2026-06-07", amount: 12000, verified: true,  type: "sale" },
  { id: 3, name: "Bidco Africa · INV #118", date: "2026-06-05", amount: 15000, verified: false, type: "purchase" },
  { id: 4, name: "ETR #4820 · Kamau HW", date: "2026-06-05", amount: 4700, verified: true,  type: "sale" },
];

export default function Receipts() {
  const [tab, setTab] = useState("My receipts");

  return (
    <div className="page">
      <div className="tab-row">
        {["My receipts", "Marketplace"].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "My receipts" && (
        <>
          <div className="alert-banner" style={{ background: "rgba(79,156,249,0.08)", borderColor: "rgba(79,156,249,0.2)" }}>
            <span>ℹ️</span>
            <div>
              <p className="alert-title" style={{ color: "#185FA5" }}>Receipt marketplace</p>
              <p className="alert-sub">Upload receipts as digital assets for verification</p>
            </div>
          </div>
          {RECEIPTS.map((r) => (
            <div key={r.id} className="txn-item">
              <span className="txn-icon">{r.type === "sale" ? "🛍️" : "📦"}</span>
              <div className="txn-info">
                <p className="txn-name">{r.name}</p>
                <p className="txn-meta">{r.date} · KES {r.amount.toLocaleString()}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span className={`badge ${r.verified ? "badge-green" : "badge-warn"}`}>
                  {r.verified ? "✓ Verified" : "Pending"}
                </span>
                <button className="link-btn">Upload</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "Marketplace" && (
        <div className="card scan-area">
          <div className="scan-icon">🏪</div>
          <p className="scan-title">Marketplace coming soon</p>
          <p className="scan-sub">Buy and verify business receipts as digital assets</p>
          <div className="badge badge-warn" style={{ marginTop: "1rem" }}>Requires legal &amp; tax compliance</div>
        </div>
      )}
    </div>
  );
}
