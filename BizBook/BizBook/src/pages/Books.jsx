import { useState } from "react";

const ALL = [
  { id: 1, type: "sale", name: "Wanjiku Stores", ref: "ETR #4821", date: "2026-06-07", amount: 12000, vat: 1860 },
  { id: 2, type: "purchase", name: "Unga Ltd", ref: "INV #203", date: "2026-06-06", amount: 8500, vat: 1317 },
  { id: 3, type: "banking", name: "M-Pesa Deposit", ref: "TXN #9931", date: "2026-06-06", amount: 30000, vat: 0 },
  { id: 4, type: "sale", name: "Kamau Hardware", ref: "ETR #4820", date: "2026-06-05", amount: 4700, vat: 728 },
  { id: 5, type: "purchase", name: "Bidco Africa", ref: "INV #118", date: "2026-06-05", amount: 15000, vat: 2325 },
  { id: 6, type: "expense", name: "Transport – Mombasa", ref: "CASH", date: "2026-06-04", amount: 3200, vat: 0 },
];

const TABS = ["All", "Sales", "Purchases", "Banking"];

const typeColor = { sale: "credit", purchase: "debit", banking: "credit", expense: "debit" };
const typeSign  = { sale: "+", purchase: "-", banking: "+", expense: "-" };
const typeIcon  = { sale: "🛍️", purchase: "📦", banking: "🏦", expense: "🚚" };

export default function Books() {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ALL.filter((t) => {
    const matchTab =
      tab === "All" ||
      (tab === "Sales" && t.type === "sale") ||
      (tab === "Purchases" && t.type === "purchase") ||
      (tab === "Banking" && t.type === "banking");
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.ref.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalIn  = filtered.filter(t => typeSign[t.type] === "+").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => typeSign[t.type] === "-").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page">
      {/* Summary */}
      <div className="card balance-row" style={{ padding: "1rem" }}>
        <div>
          <p className="label">Total In</p>
          <p className="stat up">KES {totalIn.toLocaleString()}</p>
        </div>
        <div className="divider-v" />
        <div>
          <p className="label">Total Out</p>
          <p className="stat down">KES {totalOut.toLocaleString()}</p>
        </div>
        <div className="divider-v" />
        <div>
          <p className="label">Net</p>
          <p className="stat">KES {(totalIn - totalOut).toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <input
        className="search-input"
        placeholder="🔍  Search by name or reference…"
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
        <p className="empty-state">No transactions found.</p>
      ) : (
        filtered.map((txn) => (
          <div key={txn.id} className="txn-item">
            <span className="txn-icon">{typeIcon[txn.type]}</span>
            <div className="txn-info">
              <p className="txn-name">{txn.name}</p>
              <p className="txn-meta">{txn.ref} · {txn.date}{txn.vat ? ` · VAT ${txn.vat.toLocaleString()}` : ""}</p>
            </div>
            <span className={`txn-amt ${typeColor[txn.type]}`}>
              {typeSign[txn.type]}{txn.amount.toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
