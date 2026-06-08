import { useState } from "react";

const DAYS = [
  { day: "Mon 02", cashIn: 15000, cashOut: 3000, notes: "Sales + M-Pesa" },
  { day: "Tue 03", cashIn: 8500,  cashOut: 5000, notes: "Sales" },
  { day: "Wed 04", cashIn: 12000, cashOut: 3200, notes: "Sales + Transport" },
  { day: "Thu 05", cashIn: 19700, cashOut: 15000, notes: "Sales + Bidco purchase" },
  { day: "Fri 06", cashIn: 30000, cashOut: 8500,  notes: "Deposit + Unga purchase" },
  { day: "Sat 07", cashIn: 12000, cashOut: 0,     notes: "Sales" },
];

export default function CashFlow() {
  const [selected, setSelected] = useState(null);

  const maxVal = Math.max(...DAYS.map(d => Math.max(d.cashIn, d.cashOut)));
  const totalIn  = DAYS.reduce((s, d) => s + d.cashIn,  0);
  const totalOut = DAYS.reduce((s, d) => s + d.cashOut, 0);

  return (
    <div className="page">
      {/* Summary */}
      <div className="card balance-row" style={{ padding: "1rem" }}>
        <div>
          <p className="label">Cash In</p>
          <p className="stat up">KES {totalIn.toLocaleString()}</p>
        </div>
        <div className="divider-v" />
        <div>
          <p className="label">Cash Out</p>
          <p className="stat down">KES {totalOut.toLocaleString()}</p>
        </div>
        <div className="divider-v" />
        <div>
          <p className="label">Net Cash</p>
          <p className="stat">KES {(totalIn - totalOut).toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: "1rem" }}>Daily cash flow</p>
        <div className="cashflow-chart">
          {DAYS.map((d, i) => (
            <div
              key={d.day}
              className={`cf-day ${selected === i ? "selected" : ""}`}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              <div className="cf-bars">
                <div className="cf-bar in"  style={{ height: `${(d.cashIn  / maxVal) * 100}%` }} />
                <div className="cf-bar out" style={{ height: `${(d.cashOut / maxVal) * 100}%` }} />
              </div>
              <p className="cf-label">{d.day.split(" ")[0]}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="cf-legend">
          <span className="legend-dot in" /> <span className="label">Cash in</span>
          <span className="legend-dot out" style={{ marginLeft: "1rem" }} /> <span className="label">Cash out</span>
        </div>
      </div>

      {/* Detail panel */}
      {selected !== null && (
        <div className="card detail-card">
          <p className="section-title">{DAYS[selected].day}</p>
          <div className="detail-row">
            <span className="label">Cash in</span>
            <span className="stat up">+{DAYS[selected].cashIn.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Cash out</span>
            <span className="stat down">-{DAYS[selected].cashOut.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Net</span>
            <span className="stat">{(DAYS[selected].cashIn - DAYS[selected].cashOut).toLocaleString()}</span>
          </div>
          <p className="txn-meta" style={{ marginTop: "0.5rem" }}>{DAYS[selected].notes}</p>
        </div>
      )}

      {/* Timeline list */}
      <p className="section-title">Timeline</p>
      {DAYS.slice().reverse().map((d) => (
        <div key={d.day} className="txn-item">
          <span className="txn-icon">📅</span>
          <div className="txn-info">
            <p className="txn-name">{d.day}</p>
            <p className="txn-meta">{d.notes}</p>
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
