import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";
import { formatKES } from "../utils/formatCurrency";
import { buildVATReturn, generateTaxSummary, getVATReturnPeriod } from "../services/kra";

export default function Reports() {
  const { transactions, summary, loading } = useTransactions();
  const { profile } = useAuth();

  const period    = getVATReturnPeriod();
  const vatReturn = buildVATReturn(transactions);
  const taxSummary = generateTaxSummary(transactions, profile?.businessName, profile?.kraPin);

  function exportCSV(type) {
    const rows = transactions
      .filter(t => type === "all" || t.type === type)
      .map(t => `${t.date || ""},${t.name || ""},${t.receiptNo || ""},${t.amount || 0},${t.vat || 0},${t.type},${t.paymentMethod || ""}`)
      .join("\n");
    const csv  = `Date,Name,Receipt No,Amount,VAT,Type,Payment\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `bizbook-${type}-${period.month}-${period.year}.csv`;
    a.click();
  }

  if (loading) return <div className="page"><div className="empty-state">Loading…</div></div>;

  return (
    <div className="page">

      {/* VAT Filing Alert */}
      {period.daysLeft <= 10 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <div>
            <p className="alert-title">VAT Filing Due</p>
            <p className="alert-sub">{period.month} return · {period.daysLeft} days remaining · Due {period.dueDate}</p>
          </div>
          <button className="alert-btn" onClick={() => window.open("https://itax.kra.go.ke", "_blank")}>
            File on KRA
          </button>
        </div>
      )}

      {/* VAT Summary */}
      <div className="card">
        <p className="section-title">VAT summary · {period.month} {period.year}</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Output VAT (from sales)</span>
          <span className="stat down">{formatKES(vatReturn.outputVAT)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Input VAT (from purchases)</span>
          <span className="stat up">{formatKES(vatReturn.inputVAT)}</span>
        </div>
        <div className="detail-row">
          <span className="label" style={{ fontWeight: 600 }}>VAT payable to KRA</span>
          <span className="stat warn">{formatKES(vatReturn.vatPayable)}</span>
        </div>
        {vatReturn.vatCredit > 0 && (
          <div className="detail-row">
            <span className="label">VAT credit (refundable)</span>
            <span className="stat up">{formatKES(vatReturn.vatCredit)}</span>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="card">
        <p className="section-title">Financial summary</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Total sales ({vatReturn.salesCount} transactions)</span>
          <span className="stat up">{formatKES(vatReturn.totalSales)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total purchases ({vatReturn.purchasesCount} transactions)</span>
          <span className="stat down">{formatKES(vatReturn.totalPurchases)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Net cash position</span>
          <span className="stat">{formatKES(summary.netCash)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total transactions</span>
          <span className="stat">{vatReturn.transactionCount}</span>
        </div>
      </div>

      {/* KRA / eTIMS */}
      <div className="card">
        <p className="section-title">KRA / eTIMS</p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Business name</span>
          <span className="stat">{profile?.businessName || "Not set"}</span>
        </div>
        <div className="detail-row">
          <span className="label">KRA PIN</span>
          <span className="stat">{profile?.kraPin || "Not set"}</span>
        </div>
        <div className="detail-row">
          <span className="label">VAT due date</span>
          <span className="stat warn">{period.dueDate}</span>
        </div>
        <div className="detail-row">
          <span className="label">Days remaining</span>
          <span className={`stat ${period.daysLeft <= 5 ? "down" : period.daysLeft <= 10 ? "warn" : "up"}`}>
            {period.daysLeft} days
          </span>
        </div>
        <div className="btn-row" style={{ marginTop: "1rem" }}>
          <button className="btn-secondary" style={{ flex: 1 }}
            onClick={() => window.open("https://itax.kra.go.ke", "_blank")}>
            Open iTax
          </button>
          <button className="btn-primary" style={{ flex: 1 }}
            onClick={() => window.open("https://etims.kra.go.ke", "_blank")}>
            Open eTIMS
          </button>
        </div>
      </div>

      {/* Download / Export */}
      <div className="card">
        <p className="section-title">Export reports</p>
        {[
          { label: "Sales log (CSV)",     icon: "📊", action: () => exportCSV("sale") },
          { label: "Purchase log (CSV)",  icon: "📦", action: () => exportCSV("purchase") },
          { label: "Full books (CSV)",    icon: "📋", action: () => exportCSV("all") },
        ].map((r) => (
          <div key={r.label} className="txn-item" style={{ cursor: "pointer" }} onClick={r.action}>
            <span className="txn-icon">{r.icon}</span>
            <div className="txn-info"><p className="txn-name">{r.label}</p></div>
            <span className="link-btn">↓ Download</span>
          </div>
        ))}
      </div>

    </div>
  );
}
