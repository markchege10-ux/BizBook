import { useState, useEffect, useMemo } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";
import { formatKES } from "../utils/formatCurrency";
import { buildVATReturn, generateTaxSummary, getVATReturnPeriod } from "../services/kra";
import { listenClients } from "../services/clients";

export default function Reports() {
  const { transactions, summary, loading } = useTransactions();
  const { profile, user }                 = useAuth();
  const [clients,        setClients]       = useState([]);
  const [selectedClient, setSelectedClient]= useState(null); // null = own books
  const [view,           setView]          = useState("overview"); // overview | vat | etims | clients

  // Load clients
  useEffect(() => {
    if (!user) return;
    const unsub = listenClients(user.uid, setClients);
    return () => unsub();
  }, [user?.uid]);

  const period    = getVATReturnPeriod();
  const vatReturn = useMemo(() => buildVATReturn(transactions), [transactions]);

  function exportCSV(type) {
    const rows = transactions
      .filter(t => type === "all" || t.type === type)
      .map(t => `${t.date||""},${t.name||""},${t.receiptNo||""},${t.amount||0},${t.vat||0},${t.type},${t.paymentMethod||""}`)
      .join("\n");
    const csv  = `Date,Name,Receipt No,Amount,VAT,Type,Payment\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `bizbook-${type}-${period.month}-${period.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="page"><div className="empty-state">Loading…</div></div>;

  // ── CLIENT DETAIL VIEW ──
  if (selectedClient) return (
    <div className="page">
      <button className="link-btn" onClick={() => setSelectedClient(null)}>← Back to reports</button>

      {/* Client header */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "18px" }}>{selectedClient.businessName}</p>
            <p className="label">{selectedClient.contactName}</p>
          </div>
          <span className="badge badge-green">{selectedClient.type || "Client"}</span>
        </div>

        {/* Company data */}
        <div style={{ marginTop: "1rem" }}>
          {[
            { label: "Phone",    value: selectedClient.phone },
            { label: "Email",    value: selectedClient.email },
            { label: "KRA PIN",  value: selectedClient.kraPin },
            { label: "Industry", value: selectedClient.industry },
            { label: "Address",  value: selectedClient.address },
            { label: "Notes",    value: selectedClient.notes },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="detail-row">
              <span className="label">{f.label}</span>
              <span style={{ fontSize: "13px", color: "var(--text)" }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Client financial summary placeholder */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: "0.75rem" }}>Financial overview</p>
        <p className="label" style={{ lineHeight: 1.7 }}>
          To view this client's full books, ask them to share their BizBook access code with you via Settings → Accountant Access.
        </p>
        <div className="detail-row" style={{ marginTop: "0.75rem" }}>
          <span className="label">Client since</span>
          <span style={{ fontSize: "13px", color: "var(--text)" }}>
            {selectedClient.createdAt?.toDate?.().toLocaleDateString("en-KE") ?? "—"}
          </span>
        </div>
        <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
          Request book access
        </button>
      </div>

      {/* Actions */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: "0.75rem" }}>Actions</p>
        {[
          { label: "Generate client report", icon: "📊" },
          { label: "Send invoice",           icon: "📧" },
          { label: "View transactions",      icon: "📋" },
        ].map(a => (
          <div key={a.label} className="txn-item" style={{ cursor: "pointer" }}>
            <span className="txn-icon">{a.icon}</span>
            <div className="txn-info"><p className="txn-name">{a.label}</p></div>
            <span className="link-btn">→</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── MAIN REPORTS VIEW ──
  return (
    <div className="page">

      {/* View tabs */}
      <div className="tab-row">
        {[
          { id: "overview", label: "Overview" },
          { id: "vat",      label: "VAT" },
          { id: "etims",    label: "KRA/eTIMS" },
          { id: "clients",  label: "Clients" },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${view === t.id ? "active" : ""}`} onClick={() => setView(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {view === "overview" && (
        <>
          {period.daysLeft <= 10 && (
            <div className="alert-banner">
              <span className="alert-icon">⚠️</span>
              <div>
                <p className="alert-title">VAT Filing Due</p>
                <p className="alert-sub">{period.month} return · {period.daysLeft} days · Due {period.dueDate}</p>
              </div>
              <button className="alert-btn" onClick={() => window.open("https://itax.kra.go.ke","_blank")}>File</button>
            </div>
          )}

          <div className="card">
            <p className="section-title" style={{ marginBottom: "0.75rem" }}>Financial summary</p>
            {[
              { label: `Total sales (${vatReturn.salesCount})`,       value: formatKES(vatReturn.totalSales),     color: "var(--accent)" },
              { label: `Total purchases (${vatReturn.purchasesCount})`,value: formatKES(vatReturn.totalPurchases),color: "var(--danger)" },
              { label: "Net cash",                                     value: formatKES(summary.netCash),          color: "var(--text)"   },
              { label: "VAT payable",                                  value: formatKES(vatReturn.vatPayable),     color: "var(--warn)"   },
              { label: "Total transactions",                           value: vatReturn.transactionCount,          color: "var(--text)"   },
            ].map(r => (
              <div key={r.label} className="detail-row">
                <span className="label">{r.label}</span>
                <span style={{ fontWeight: 600, fontSize: "14px", color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="section-title" style={{ marginBottom: "0.75rem" }}>Export reports</p>
            {[
              { label: "Sales log (CSV)",    icon: "📊", action: () => exportCSV("sale") },
              { label: "Purchase log (CSV)", icon: "📦", action: () => exportCSV("purchase") },
              { label: "Full books (CSV)",   icon: "📋", action: () => exportCSV("all") },
            ].map(r => (
              <div key={r.label} className="txn-item" style={{ cursor: "pointer" }} onClick={r.action}>
                <span className="txn-icon">{r.icon}</span>
                <div className="txn-info"><p className="txn-name">{r.label}</p></div>
                <span className="link-btn">↓ Download</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── VAT ── */}
      {view === "vat" && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "0.75rem" }}>VAT Summary · {period.month} {period.year}</p>
          <div className="detail-row">
            <span className="label">Output VAT (sales)</span>
            <span className="stat down">{formatKES(vatReturn.outputVAT)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Input VAT (purchases)</span>
            <span className="stat up">{formatKES(vatReturn.inputVAT)}</span>
          </div>
          <div className="detail-row" style={{ borderTop: "1px solid var(--border2)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>VAT payable</span>
            <span className="stat warn">{formatKES(vatReturn.vatPayable)}</span>
          </div>
          {vatReturn.vatCredit > 0 && (
            <div className="detail-row">
              <span className="label">VAT credit</span>
              <span className="stat up">{formatKES(vatReturn.vatCredit)}</span>
            </div>
          )}
          <div className="detail-row" style={{ marginTop: "0.5rem" }}>
            <span className="label">Due date</span>
            <span className={`stat ${period.daysLeft <= 5 ? "down" : period.daysLeft <= 10 ? "warn" : ""}`}>{period.dueDate} ({period.daysLeft} days)</span>
          </div>
          <button className="btn-primary" style={{ width: "100%", marginTop: "1.25rem" }} onClick={() => window.open("https://itax.kra.go.ke","_blank")}>
            File VAT on iTax →
          </button>
        </div>
      )}

      {/* ── KRA / eTIMS ── */}
      {view === "etims" && (
        <>
          <div className="card">
            <p className="section-title" style={{ marginBottom: "0.75rem" }}>Business details</p>
            {[
              { label: "Business name", value: profile?.businessName || "Not set" },
              { label: "KRA PIN",       value: profile?.kraPin       || "Not set" },
              { label: "Phone",         value: profile?.phone        || "Not set" },
              { label: "Plan",          value: profile?.plan         || "starter" },
            ].map(r => (
              <div key={r.label} className="detail-row">
                <span className="label">{r.label}</span>
                <span style={{ fontSize: "13px", color: "var(--text)" }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="section-title" style={{ marginBottom: "0.75rem" }}>KRA portals</p>
            {[
              { label: "iTax — file VAT returns",        url: "https://itax.kra.go.ke",    icon: "🏛️" },
              { label: "eTIMS — manage ETR invoices",    url: "https://etims.kra.go.ke",   icon: "🧾" },
              { label: "KRA — general services",         url: "https://www.kra.go.ke",     icon: "📋" },
            ].map(l => (
              <div key={l.label} className="txn-item" style={{ cursor: "pointer" }} onClick={() => window.open(l.url,"_blank")}>
                <span className="txn-icon">{l.icon}</span>
                <div className="txn-info"><p className="txn-name">{l.label}</p></div>
                <span className="link-btn">→</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CLIENTS TAB ── */}
      {view === "clients" && (
        <>
          <p className="label">Tap a client to view their company data</p>
          {clients.length === 0 ? (
            <div className="empty-state">No clients yet — add them in the Clients section.</div>
          ) : (
            clients.map(c => (
              <div key={c.id} className="txn-item" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                <span className="txn-icon">🏢</span>
                <div className="txn-info">
                  <p className="txn-name">{c.businessName}</p>
                  <p className="txn-meta">{c.contactName}{c.kraPin ? ` · ${c.kraPin}` : ""}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span className="badge badge-green">{c.type || "Client"}</span>
                  <span className="link-btn">View →</span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
