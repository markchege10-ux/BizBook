import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { formatKES } from "../utils/formatCurrency";

export default function CashFlow() {
  const { cashFlowDays, summary, transactions, loading } = useTransactions();
  const [selected, setSelected] = useState(null);

  if (loading) return <div className="page"><div className="empty-state">Loading…</div></div>;

  const maxVal = Math.max(...cashFlowDays.map(d => Math.max(d.cashIn, d.cashOut)), 1);

  return (
    <div className="page">
      {/* Summary */}
      <div className="card balance-row" style={{ padding: "1rem" }}>
        <div><p className="label">Cash In</p><p className="stat up">{formatKES(summary.cashIn)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Cash Out</p><p className="stat down">{formatKES(summary.cashOut)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Net Cash</p><p className="stat">{formatKES(summary.netCash)}</p></div>
      </div>

      {/* Chart */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: "1rem" }}>Daily cash flow · Last 7 days</p>
        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: "2rem 0" }}>No transactions yet</div>
        ) : (
          <>
            <div className="cashflow-chart">
              {cashFlowDays.map((d, i) => (
                <div
                  key={d.date}
                  className={`cf-day ${selected === i ? "selected" : ""}`}
                  onClick={() => setSelected(selected === i ? null : i)}
                >
                  <div className="cf-bars">
                    <div className="cf-bar in"  style={{ height: `${(d.cashIn  / maxVal) * 100}%` }} />
                    <div className="cf-bar out" style={{ height: `${(d.cashOut / maxVal) * 100}%` }} />
                  </div>
                  <p className="cf-label">{d.label}</p>
                </div>
              ))}
            </div>
            <div className="cf-legend">
              <span className="legend-dot in" /> <span className="label">Cash in</span>
              <span className="legend-dot out" style={{ marginLeft: "1rem" }} /> <span className="label">Cash out</span>
            </div>
          </>
        )}
      </div>

      {/* Detail panel */}
      {selected !== null && cashFlowDays[selected] && (
        <div className="card detail-card">
          <p className="section-title">{cashFlowDays[selected].date}</p>
          <div className="detail-row">
            <span className="label">Cash in</span>
            <span className="stat up">+{cashFlowDays[selected].cashIn.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Cash out</span>
            <span className="stat down">-{cashFlowDays[selected].cashOut.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Net</span>
            <span className="stat">{(cashFlowDays[selected].cashIn - cashFlowDays[selected].cashOut).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Timeline list */}
      <p className="section-title">Timeline</p>
      {cashFlowDays.slice().reverse().map((d) => (
        <div key={d.date} className="txn-item">
          <span className="txn-icon">📅</span>
          <div className="txn-info">
            <p className="txn-name">{d.date}</p>
            <p className="txn-meta">{d.label}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="txn-amt credit">+{d.cashIn.toLocaleString()}</p>
            <p className="txn-amt debit" style={{ fontSize: "11px" }}>-{d.cashOut.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
