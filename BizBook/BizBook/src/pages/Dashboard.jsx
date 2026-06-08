import { useState } from "react";

const mockTransactions = [
  { id: 1, name: "Sale – Wanjiku Stores", meta: "ETR · Receipt #4821 · 09:14", amount: 12000, type: "credit", icon: "🛍️" },
  { id: 2, name: "Purchase – Unga Ltd", meta: "Supplier · Invoice #203 · Yesterday", amount: 8500, type: "debit", icon: "📦" },
  { id: 3, name: "M-Pesa Deposit", meta: "Banking · Transfer · Yesterday", amount: 30000, type: "credit", icon: "🏦" },
  { id: 4, name: "Transport – Mombasa Run", meta: "Expense · Cash · Mon 02 Jun", amount: 3200, type: "debit", icon: "🚚" },
];

const weekData = [
  { day: "Mon", in: 60, out: 30 },
  { day: "Tue", in: 80, out: 45 },
  { day: "Wed", in: 50, out: 20 },
  { day: "Thu", in: 90, out: 55 },
  { day: "Fri", in: 70, out: 35 },
  { day: "Sat", in: 100, out: 60 },
  { day: "Sun", in: 65, out: 25 },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("Week");

  return (
    <div className="page">
      {/* Balance Card */}
      <div className="card balance-card">
        <p className="label">Net Cash · This Month</p>
        <h2 className="balance-amount">
          <span>KES </span>142,500
        </h2>
        <div className="balance-row">
          <div>
            <p className="label">Cash In</p>
            <p className="stat up">↑ 215,000</p>
          </div>
          <div className="divider-v" />
          <div>
            <p className="label">Cash Out</p>
            <p className="stat down">↓ 72,500</p>
          </div>
          <div className="divider-v" />
          <div>
            <p className="label">VAT Due</p>
            <p className="stat warn">34,400</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <p className="section-title">Quick actions</p>
        <div className="quick-actions">
          {[
            { icon: "📷", label: "Scan Receipt", to: "/scanner" },
            { icon: "📊", label: "Add Sale", to: "/books" },
            { icon: "🧾", label: "ETR Log", to: "/books" },
            { icon: "📤", label: "KRA Report", to: "/reports" },
          ].map((a) => (
            <button key={a.label} className="qa-btn" onClick={() => window.location.hash = a.to}>
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-label">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* KRA Alert */}
      <div className="alert-banner warn">
        <span className="alert-icon">⚠️</span>
        <div>
          <p className="alert-title">VAT Filing Due</p>
          <p className="alert-sub">June return · 8 days remaining</p>
        </div>
        <button className="alert-btn">File Now</button>
      </div>

      {/* Cash Flow Chart */}
      <section>
        <div className="section-header">
          <p className="section-title">Cash flow</p>
          <div className="pills">
            {["Week", "Month"].map((p) => (
              <button
                key={p}
                className={`pill ${period === p ? "active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="chart-bars">
            {weekData.map((d) => (
              <div key={d.day} className="bar-group">
                <div className="bar in" style={{ height: `${d.in}%` }} />
                <div className="bar out" style={{ height: `${d.out}%` }} />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {weekData.map((d) => <span key={d.day}>{d.day}</span>)}
          </div>
          <div className="cashflow-totals">
            <div><p className="label">Cash In</p><p className="stat up">54,500</p></div>
            <div><p className="label">Cash Out</p><p className="stat down">18,200</p></div>
            <div><p className="label">Net</p><p className="stat">36,300</p></div>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="section-header">
          <p className="section-title">Recent transactions</p>
          <button className="link-btn" onClick={() => window.location.hash = "/books"}>View all →</button>
        </div>
        {mockTransactions.map((txn) => (
          <div key={txn.id} className="txn-item">
            <span className="txn-icon">{txn.icon}</span>
            <div className="txn-info">
              <p className="txn-name">{txn.name}</p>
              <p className="txn-meta">{txn.meta}</p>
            </div>
            <span className={`txn-amt ${txn.type}`}>
              {txn.type === "credit" ? "+" : "-"}{txn.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
