export default function Reports() {
    const vatData = [
      { label: "Output VAT (Sales)",   amount: 34710, type: "debit" },
      { label: "Input VAT (Purchases)", amount: 3642, type: "credit" },
      { label: "VAT Payable",          amount: 31068, type: "warn" },
    ];
  
    return (
      <div className="page">
        {/* VAT Summary */}
        <div className="card">
          <p className="section-title">VAT summary · June 2026</p>
          <div className="alert-banner warn" style={{ marginTop: "0.75rem" }}>
            <span>⚠️</span>
            <div>
              <p className="alert-title">Filing due in 8 days</p>
              <p className="alert-sub">30 June 2026</p>
            </div>
            <button className="alert-btn">File on KRA</button>
          </div>
          {vatData.map((v) => (
            <div key={v.label} className="detail-row" style={{ marginTop: "0.75rem" }}>
              <span className="label">{v.label}</span>
              <span className={`stat ${v.type}`}>KES {v.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
  
        {/* ETR Summary */}
        <div className="card">
          <p className="section-title">ETR receipts · June 2026</p>
          <div className="detail-row" style={{ marginTop: "0.75rem" }}>
            <span className="label">Total receipts issued</span>
            <span className="stat">24</span>
          </div>
          <div className="detail-row">
            <span className="label">Total sales value</span>
            <span className="stat up">KES 215,000</span>
          </div>
          <div className="detail-row">
            <span className="label">VAT collected</span>
            <span className="stat">KES 34,710</span>
          </div>
          <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>
            Export ETR report
          </button>
        </div>
  
        {/* KRA Integration */}
        <div className="card">
          <p className="section-title">KRA / eTIMS</p>
          <div className="detail-row" style={{ marginTop: "0.75rem" }}>
            <span className="label">eTIMS invoices read</span>
            <span className="stat">18</span>
          </div>
          <div className="detail-row">
            <span className="label">Last sync</span>
            <span className="stat">Today, 08:30</span>
          </div>
          <div className="btn-row" style={{ marginTop: "1rem" }}>
            <button className="btn-secondary">Sync eTIMS</button>
            <button className="btn-primary">Submit VAT return</button>
          </div>
        </div>
  
        {/* Download options */}
        <div className="card">
          <p className="section-title">Download reports</p>
          {["VAT return (PDF)", "Sales log (CSV)", "Purchase log (CSV)", "Full books (Excel)"].map((r) => (
            <div key={r} className="txn-item" style={{ cursor: "pointer" }}>
              <span className="txn-icon">📄</span>
              <div className="txn-info">
                <p className="txn-name">{r}</p>
              </div>
              <span className="link-btn">↓</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  