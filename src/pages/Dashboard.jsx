import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";
import { formatKES } from "../utils/formatCurrency";

export default function Dashboard({ navigate }) {
  const { user, profile } = useAuth();
  const { transactions, summary, cashFlowDays, loading } = useTransactions();

  const recentTxns = transactions.slice(0, 5);
  const name = profile?.name ?? user?.displayName ?? "there";
  const firstName = name.split(" ")[0];

  const typeIcon  = { sale: "🛍️", purchase: "📦", banking: "🏦", expense: "🚚" };
  const typeColor = { sale: "credit", purchase: "debit", banking: "credit", expense: "debit" };
  const typeSign  = { sale: "+", purchase: "-", banking: "+", expense: "-" };

  const maxBar = Math.max(...cashFlowDays.map(d => Math.max(d.cashIn, d.cashOut)), 1);

  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const vatDue = summary.vat.payable;

  if (loading) return <div className="page"><div className="empty-state">Loading your books…</div></div>;

  return (
    <div className="page">
      {/* Greeting */}
      <div>
        <p className="label">{today}</p>
        <p style={{ fontSize: "18px", fontWeight: 600 }}>Good day, {firstName} 👋</p>
      </div>

      {/* Balance Card */}
      <div className="card balance-card">
        <p className="label">Net Cash · This Month</p>
        <h2 className="balance-amount"><span>KES </span>{summary.netCash.toLocaleString()}</h2>
        <div className="balance-row">
          <div>
            <p className="label">Cash In</p>
            <p className="stat up">↑ {summary.cashIn.toLocaleString()}</p>
          </div>
          <div className="divider-v" />
          <div>
            <p className="label">Cash Out</p>
            <p className="stat down">↓ {summary.cashOut.toLocaleString()}</p>
          </div>
          <div className="divider-v" />
          <div>
            <p className="label">VAT Due</p>
            <p className="stat warn">{vatDue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <p className="section-title">Quick actions</p>
        <div className="quick-actions">
          {[
            { icon: "📷", label: "Scan Receipt", to: "/scanner" },
            { icon: "📊", label: "Add Sale",     to: "/books" },
            { icon: "🧾", label: "ETR Log",      to: "/books" },
            { icon: "📤", label: "KRA Report",   to: "/reports" },
          ].map((a) => (
            <button key={a.label} className="qa-btn" onClick={() => navigate(a.to)}>
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-label">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* VAT Alert */}
      {vatDue > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <div>
            <p className="alert-title">VAT Payable</p>
            <p className="alert-sub">{formatKES(vatDue)} due to KRA</p>
          </div>
          <button className="alert-btn" onClick={() => navigate("/reports")}>View</button>
        </div>
      )}

      {/* Cash Flow Chart */}
      <section>
        <div className="section-header">
          <p className="section-title">Cash flow · Last 7 days</p>
        </div>
        <div className="card">
          <div className="chart-bars">
            {cashFlowDays.map((d) => (
              <div key={d.date} className="bar-group">
                <div className="bar in"  style={{ height: `${(d.cashIn  / maxBar) * 100}%` }} />
                <div className="bar out" style={{ height: `${(d.cashOut / maxBar) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {cashFlowDays.map((d) => <span key={d.date}>{d.label}</span>)}
          </div>
          <div className="cashflow-totals">
            <div><p className="label">Cash In</p><p className="stat up">{summary.cashIn.toLocaleString()}</p></div>
            <div><p className="label">Cash Out</p><p className="stat down">{summary.cashOut.toLocaleString()}</p></div>
            <div><p className="label">Net</p><p className="stat">{summary.netCash.toLocaleString()}</p></div>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="section-header">
          <p className="section-title">Recent transactions</p>
          <button className="link-btn" onClick={() => navigate("/books")}>View all →</button>
        </div>
        {recentTxns.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "32px" }}>📋</p>
            <p className="label" style={{ marginTop: "0.5rem" }}>No transactions yet</p>
            <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/scanner")}>
              📷 Scan your first receipt
            </button>
          </div>
        ) : (
          recentTxns.map((txn) => (
            <div key={txn.id} className="txn-item">
              <span className="txn-icon">{typeIcon[txn.type] ?? "💳"}</span>
              <div className="txn-info">
                <p className="txn-name">{txn.name || "Unnamed"}</p>
                <p className="txn-meta">{txn.receiptNo ? `${txn.receiptNo} · ` : ""}{txn.date ?? ""}</p>
              </div>
              <span className={`txn-amt ${typeColor[txn.type] ?? "credit"}`}>
                {typeSign[txn.type]}{(parseFloat(txn.amount)||0).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
