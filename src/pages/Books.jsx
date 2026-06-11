import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { formatKES } from "../utils/formatCurrency";
import { formatDate } from "../utils/dateHelpers";

const TABS = ["All", "Sales", "Purchases", "Banking", "Expenses"];
const typeIcon  = { sale: "🛍️", purchase: "📦", banking: "🏦", expense: "🚚" };
const typeColor = { sale: "credit", purchase: "debit", banking: "credit", expense: "debit" };
const typeSign  = { sale: "+", purchase: "-", banking: "+", expense: "-" };
const tabType   = { Sales: "sale", Purchases: "purchase", Banking: "banking", Expenses: "expense" };

export default function Books() {
  const { transactions, summary, loading, deleteTxn } = useTransactions();
  const [tab, setTab]       = useState("All");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const filtered = transactions.filter((t) => {
    const matchTab = tab === "All" || t.type === tabType[tab];
    const matchSearch = !search || [t.name, t.receiptNo, t.productCategory]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  async function handleDelete(id) {
    await deleteTxn(id);
    setConfirm(null);
  }

  if (loading) return <div className="page"><div className="empty-state">Loading…</div></div>;

  return (
    <div className="page">
      {/* Summary */}
      <div className="card balance-row" style={{ padding: "1rem" }}>
        <div><p className="label">Total In</p><p className="stat up">{formatKES(summary.cashIn)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Total Out</p><p className="stat down">{formatKES(summary.cashOut)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Net</p><p className="stat">{formatKES(summary.netCash)}</p></div>
      </div>

      {/* Search */}
      <input
        className="search-input"
        placeholder="🔍  Search by name, reference…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Tabs */}
      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          {transactions.length === 0 ? "No transactions yet — scan a receipt to get started!" : "No results found."}
        </div>
      ) : (
        filtered.map((txn) => (
          <div key={txn.id} className="txn-item">
            <span className="txn-icon">{typeIcon[txn.type] ?? "💳"}</span>
            <div className="txn-info">
              <p className="txn-name">{txn.name || "Unnamed"}</p>
              <p className="txn-meta">
                {txn.receiptNo ? `${txn.receiptNo} · ` : ""}
                {txn.date ?? formatDate(txn.createdAt)}
                {txn.vat > 0 ? ` · VAT ${txn.vat.toLocaleString()}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <span className={`txn-amt ${typeColor[txn.type] ?? "credit"}`}>
                {typeSign[txn.type]}{(parseFloat(txn.amount)||0).toLocaleString()}
              </span>
              <button
                style={{ fontSize: "11px", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setConfirm(txn.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* Delete confirmation */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1.5rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "340px" }}>
            <p className="section-title">Delete transaction?</p>
            <p className="label" style={{ marginTop: "0.5rem" }}>This cannot be undone.</p>
            <div className="btn-row" style={{ marginTop: "1.25rem" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
