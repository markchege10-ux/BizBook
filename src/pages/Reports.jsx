import { useTransactions } from "../hooks/useTransactions";
import { formatKES } from "../utils/formatCurrency";

export default function Reports() {
  const { transactions, summary, loading } = useTransactions();
  const { outputVAT, inputVAT, payable } = summary.vat;

  const etrCount  = transactions.filter(t => t.type === "sale").length;
  const etrTotal  = transactions.filter(t => t.type === "sale").reduce((s,t) => s + (parseFloat(t.amount)||0), 0);
  const purchTotal= transactions.filter(t => t.type === "purchase").reduce((s,t) => s + (parseFloat(t.amount)||0), 0);

  if (loading) return <div className="page"><div className="empty-state">Loading…</div></div>;

  return (
    <div className="page">
      {/* VAT Summary */}
      <div className="card">
        <p className="section-title">VAT summary · Current period</p>
        {payable > 0 && (
          <div className="alert-banner" style={{ marginTop: "0.75rem" }}>
            <span>⚠️</span>
            <div>
              <p className="alert-title">VAT payable to KRA</p>
              <p className="alert-sub">{formatKES(payable)}</p>
            </div>
            <button className="alert-btn">File on KRA</button>
          </div>
        )}
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Output VAT (from sales)</span>
          <span className="stat down">{formatKES(outputVAT)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Input VAT (from purchases)</span>
          <span className="stat up">{formatKES(inputVAT)}</span>
        </div>
        <div className="detail-row">
          <span className="label">VAT payable</span>
          <span className="stat warn">{formatKES(payable)}</span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card">
        <p className="section-title">Financial summary</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Total sales revenue</span>
          <span className="stat up">{formatKES(etrTotal)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total purchases</span>
          <span className="stat down">{formatKES(purchTotal)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Net cash</span>
          <span className="stat">{formatKES(summary.netCash)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total transactions</span>
          <span className="stat">{summary.count}</span>
        </div>
      </div>

      {/* ETR Summary */}
      <div className="card">
        <p className="section-title">ETR receipts</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Total ETR receipts issued</span>
          <span className="stat">{etrCount}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total sales value</span>
          <span className="stat up">{formatKES(etrTotal)}</span>
        </div>
        <div className="detail-row">
          <span className="label">VAT collected</span>
          <span className="stat">{formatKES(outputVAT)}</span>
        </div>
        <button className="btn-primary" style={{ marginTop: "1rem", width: "100%" }}>
          Export ETR report
        </button>
      </div>

      {/* KRA / eTIMS */}
      <div className="card">
        <p className="section-title">KRA / eTIMS</p>
        <p className="label" style={{ marginTop: "0.75rem" }}>Integration coming soon — will connect directly to KRA eTIMS for invoice reading, VAT filing and tax summaries.</p>
        <div className="btn-row" style={{ marginTop: "1rem" }}>
          <button className="btn-secondary" style={{ flex: 1 }} disabled>Sync eTIMS</button>
          <button className="btn-primary"   style={{ flex: 1 }} disabled>Submit VAT return</button>
        </div>
      </div>

      {/* Download */}
      <div className="card">
        <p className="section-title">Download reports</p>
        {["VAT return (PDF)", "Sales log (CSV)", "Purchase log (CSV)", "Full books (Excel)"].map((r) => (
          <div key={r} className="txn-item" style={{ cursor: "pointer" }}>
            <span className="txn-icon">📄</span>
            <div className="txn-info"><p className="txn-name">{r}</p></div>
            <span className="link-btn">↓</span>
          </div>
        ))}
      </div>
    </div>
  );
}
