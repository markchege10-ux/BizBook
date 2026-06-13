import { memo, useMemo } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";
import { formatKES } from "../utils/formatCurrency";

// Memoized sub-components — only re-render when their props change
const BalanceCard = memo(({ summary }) => (
  <div className="card balance-card">
    <p className="label">Net Cash · This Month</p>
    <h2 className="balance-amount"><span>KES </span>{summary.netCash.toLocaleString()}</h2>
    <div className="balance-row">
      <div><p className="label">Cash In</p><p className="stat up">↑ {summary.cashIn.toLocaleString()}</p></div>
      <div className="divider-v" />
      <div><p className="label">Cash Out</p><p className="stat down">↓ {summary.cashOut.toLocaleString()}</p></div>
      <div className="divider-v" />
      <div><p className="label">VAT Due</p><p className="stat warn">{summary.vat.payable.toLocaleString()}</p></div>
    </div>
  </div>
));

const CashFlowChart = memo(({ days }) => {
  const maxBar = useMemo(() => Math.max(...days.map(d => Math.max(d.cashIn, d.cashOut)), 1), [days]);
  return (
    <div className="card">
      <div className="chart-bars">
        {days.map((d) => (
          <div key={d.date} className="bar-group">
            <div className="bar in"  style={{ height: `${(d.cashIn  / maxBar) * 100}%` }} />
            <div className="bar out" style={{ height: `${(d.cashOut / maxBar) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="chart-labels">
        {days.map((d) => <span key={d.date}>{d.label}</span>)}
      </div>
      <div className="cashflow-totals">
        <div><p className="label">Cash In</p><p className="stat up">{days.reduce((s,d)=>s+d.cashIn,0).toLocaleString()}</p></div>
        <div><p className="label">Cash Out</p><p className="stat down">{days.reduce((s,d)=>s+d.cashOut,0).toLocaleString()}</p></div>
        <div><p className="label">Net</p><p className="stat">{days.reduce((s,d)=>s+d.cashIn-d.cashOut,0).toLocaleString()}</p></div>
      </div>
    </div>
  );
});

const TxnItem = memo(({ txn }) => {
  const typeIcon  = { sale:"🛍️", purchase:"📦", banking:"🏦", expense:"🚚" };
  const typeColor = { sale:"credit", purchase:"debit", banking:"credit", expense:"debit" };
  const typeSign  = { sale:"+", purchase:"-", banking:"+", expense:"-" };
  return (
    <div className="txn-item">
      <span className="txn-icon">{typeIcon[txn.type] ?? "💳"}</span>
      <div className="txn-info">
        <p className="txn-name">{txn.name || "Unnamed"}</p>
        <p className="txn-meta">{txn.receiptNo ? `${txn.receiptNo} · ` : ""}{txn.date ?? ""}</p>
      </div>
      <span className={`txn-amt ${typeColor[txn.type] ?? "credit"}`}>
        {typeSign[txn.type]}{(parseFloat(txn.amount)||0).toLocaleString()}
      </span>
    </div>
  );
});

const QuickActions = memo(({ navigate }) => (
  <div className="quick-actions">
    {[
      { icon:"📷", label:"Scan Receipt", to:"/scanner" },
      { icon:"📊", label:"Add Sale",     to:"/books"   },
      { icon:"🧾", label:"ETR Log",      to:"/books"   },
      { icon:"📤", label:"KRA Report",   to:"/reports" },
    ].map((a) => (
      <button key={a.label} className="qa-btn" onClick={() => navigate(a.to)}>
        <span className="qa-icon">{a.icon}</span>
        <span className="qa-label">{a.label}</span>
      </button>
    ))}
  </div>
));

export default function Dashboard({ navigate }) {
  const { user, profile } = useAuth();
  const { transactions, summary, cashFlowDays, loading } = useTransactions();

  const firstName   = useMemo(() => (profile?.name ?? user?.displayName ?? "there").split(" ")[0], [profile, user]);
  const recentTxns  = useMemo(() => transactions.slice(0, 5), [transactions]);
  const today       = useMemo(() => new Date().toLocaleDateString("en-KE", { weekday:"long", day:"numeric", month:"long" }), []);

  // Show skeleton while loading
  if (loading) return (
    <div className="page">
      <div className="card" style={{ height:"120px", background:"var(--surface2)", animation:"pulse 1.5s ease infinite" }} />
      <div className="card" style={{ height:"60px",  background:"var(--surface2)", animation:"pulse 1.5s ease infinite" }} />
      <div className="card" style={{ height:"160px", background:"var(--surface2)", animation:"pulse 1.5s ease infinite" }} />
    </div>
  );

  return (
    <div className="page">
      <div>
        <p className="label">{today}</p>
        <p style={{ fontSize:"18px", fontWeight:600 }}>Hello, {firstName} 👋</p>
      </div>

      <BalanceCard summary={summary} />

      <section>
        <p className="section-title" style={{ marginBottom:"0.75rem" }}>Quick actions</p>
        <QuickActions navigate={navigate} />
      </section>

      {summary.vat.payable > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <div>
            <p className="alert-title">VAT Payable</p>
            <p className="alert-sub">{formatKES(summary.vat.payable)} due to KRA</p>
          </div>
          <button className="alert-btn" onClick={() => navigate("/reports")}>View</button>
        </div>
      )}

      <section>
        <div className="section-header" style={{ marginBottom:"0.75rem" }}>
          <p className="section-title">Cash flow · Last 7 days</p>
        </div>
        <CashFlowChart days={cashFlowDays} />
      </section>

      <section>
        <div className="section-header" style={{ marginBottom:"0.75rem" }}>
          <p className="section-title">Recent transactions</p>
          <button className="link-btn" onClick={() => navigate("/books")}>View all →</button>
        </div>
        {recentTxns.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding:"2rem" }}>
            <p style={{ fontSize:"36px" }}>📋</p>
            <p className="label" style={{ marginTop:"0.5rem" }}>No transactions yet</p>
            <button className="btn-primary" style={{ marginTop:"1rem" }} onClick={() => navigate("/scanner")}>
              📷 Scan your first receipt
            </button>
          </div>
        ) : (
          recentTxns.map(txn => <TxnItem key={txn.id} txn={txn} />)
        )}
      </section>
    </div>
  );
}
