import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { formatKES } from "../utils/formatCurrency";
import { formatDate } from "../utils/dateHelpers";
import { generateETRNumber, buildETRReceipt, formatETRReceipt } from "../services/etr";

const TABS = ["All", "Sales", "Purchases", "Banking", "Expenses"];
const typeIcon  = { sale: "🛍️", purchase: "📦", banking: "🏦", expense: "🚚" };
const typeColor = { sale: "credit", purchase: "debit", banking: "credit", expense: "debit" };
const typeSign  = { sale: "+", purchase: "-", banking: "+", expense: "-" };
const tabType   = { Sales: "sale", Purchases: "purchase", Banking: "banking", Expenses: "expense" };

export default function Books({ navigate }) {
  const { transactions, summary, loading, deleteTxn, addTxn } = useTransactions();
  const [tab,       setTab]     = useState("All");
  const [search,    setSearch]  = useState("");
  const [confirm,   setConfirm] = useState(null);
  const [etrModal,  setEtrModal] = useState(null);
  const [showAdd,   setShowAdd] = useState(false);
  const [newTxn,    setNewTxn]  = useState({ type: "sale", name: "", receiptNo: "", date: "", amount: "", vat: "0", paymentMethod: "cash" });
  const [saving,    setSaving]  = useState(false);

  const filtered = transactions.filter((t) => {
    const matchTab    = tab === "All" || t.type === tabType[tab];
    const matchSearch = !search || [t.name, t.receiptNo, t.productCategory]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  async function handleDelete(id) {
    await deleteTxn(id);
    setConfirm(null);
  }

  function viewETR(txn) {
    const receipt = buildETRReceipt({
      name: txn.name, amount: txn.amount, vat: txn.vat,
      supplierPin: txn.supplierPin, customerPin: txn.customerPin,
      paymentMethod: txn.paymentMethod,
    });
    receipt.etrNo = txn.receiptNo || generateETRNumber();
    setEtrModal(formatETRReceipt(receipt));
  }

  async function handleAddTxn(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addTxn({ ...newTxn, amount: parseFloat(newTxn.amount) || 0, vat: parseFloat(newTxn.vat) || 0 });
      setShowAdd(false);
      setNewTxn({ type: "sale", name: "", receiptNo: "", date: "", amount: "", vat: "0", paymentMethod: "cash" });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="page"><div className="empty-state">Loading…</div></div>;

  return (
    <div className="page">
      {/* Summary */}
      <div className="card balance-row" style={{ padding: "1rem", flexWrap: "wrap" }}>
        <div><p className="label">Total In</p><p className="stat up">{formatKES(summary.cashIn)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Total Out</p><p className="stat down">{formatKES(summary.cashOut)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Net</p><p className="stat">{formatKES(summary.netCash)}</p></div>
      </div>

      {/* Add + Search */}
      <div className="btn-row">
        <input className="search-input" style={{ flex: 1 }} placeholder="🔍  Search…" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      {/* Tabs */}
      <div className="tab-row">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Transactions */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          {transactions.length === 0
            ? "No transactions yet — scan a receipt or add manually!"
            : "No results found."}
        </div>
      ) : (
        filtered.map((txn) => (
          <div key={txn.id} className="txn-item">
            <span className="txn-icon">{typeIcon[txn.type] ?? "💳"}</span>
            <div className="txn-info">
              <p className="txn-name">{txn.name || "Unnamed"}</p>
              <p className="txn-meta">
                {txn.receiptNo ? `${txn.receiptNo} · ` : ""}
                {txn.date || formatDate(txn.createdAt)}
                {txn.vat > 0 ? ` · VAT ${(txn.vat).toLocaleString()}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <span className={`txn-amt ${typeColor[txn.type] ?? "credit"}`}>
                {typeSign[txn.type]}{(parseFloat(txn.amount) || 0).toLocaleString()}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                {txn.type === "sale" && (
                  <button style={{ fontSize: "11px", color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => viewETR(txn)}>ETR</button>
                )}
                <button style={{ fontSize: "11px", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setConfirm(txn.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Add Transaction Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1.5rem", overflowY: "auto" }}>
          <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
            <p className="section-title" style={{ marginBottom: "1rem" }}>Add transaction</p>
            <form onSubmit={handleAddTxn}>
              <div className="segment-control" style={{ marginBottom: "1rem" }}>
                {["sale","purchase","banking","expense"].map(t => (
                  <button key={t} type="button" className={`segment-btn ${newTxn.type === t ? "active" : ""}`}
                    onClick={() => setNewTxn(p => ({ ...p, type: t }))} style={{ fontSize: "11px" }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {[
                { label: "Name",       key: "name",      type: "text",   placeholder: "Supplier / Customer" },
                { label: "Receipt no.",key: "receiptNo", type: "text",   placeholder: "ETR-20260607-4821" },
                { label: "Date",       key: "date",      type: "date",   placeholder: "" },
                { label: "Amount (KES)",key:"amount",    type: "number", placeholder: "0" },
                { label: "VAT (KES)",  key: "vat",       type: "number", placeholder: "0" },
              ].map(f => (
                <div key={f.key} className="field-row">
                  <label className="field-label">{f.label}</label>
                  <input className="field-input" type={f.type} placeholder={f.placeholder}
                    value={newTxn[f.key]} onChange={e => setNewTxn(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="btn-row" style={{ marginTop: "1rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving || !newTxn.amount}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ETR Modal */}
      {etrModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1.5rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "380px" }}>
            <p className="section-title" style={{ marginBottom: "1rem" }}>ETR Receipt</p>
            <pre style={{ fontSize: "12px", color: "var(--text)", fontFamily: "monospace", whiteSpace: "pre-wrap", background: "var(--surface2)", padding: "1rem", borderRadius: "8px" }}>
              {etrModal}
            </pre>
            <div className="btn-row" style={{ marginTop: "1rem" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEtrModal(null)}>Close</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { navigator.clipboard?.writeText(etrModal); }}>Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1.5rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "340px" }}>
            <p className="section-title">Delete transaction?</p>
            <p className="label" style={{ marginTop: "0.5rem" }}>This cannot be undone.</p>
            <div className="btn-row" style={{ marginTop: "1.25rem" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn-danger"    style={{ flex: 1 }} onClick={() => handleDelete(confirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
