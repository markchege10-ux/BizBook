import { useState, memo, useMemo } from "react";
import { useBudget } from "../hooks/useBudget";
import { useTransactions } from "../hooks/useTransactions";
import { formatKES } from "../utils/formatCurrency";

const CATEGORIES = [
  "Purchases", "Rent", "Transport", "Salaries", "Utilities",
  "Marketing", "Equipment", "Stock", "Other"
];

const BudgetCard = memo(({ budget, spent, onEdit, onDelete }) => {
  const pct      = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const remaining = budget.amount - spent;
  const over      = remaining < 0;

  return (
    <div className="card" style={{ padding: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "14px" }}>{budget.category}</p>
          <p className="label">{budget.period ?? "Monthly"}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="link-btn" onClick={() => onEdit(budget)}>Edit</button>
          <button style={{ fontSize: "12px", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }} onClick={() => onDelete(budget.id)}>Delete</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ margin: "0.75rem 0 0.4rem", background: "var(--surface2)", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--danger)" : pct > 80 ? "var(--warn)" : "var(--accent)", borderRadius: "20px", transition: "width 0.4s ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p className="label">Spent: <strong style={{ color: over ? "var(--danger)" : "var(--text)" }}>{formatKES(spent)}</strong></p>
        <p className="label">Budget: <strong>{formatKES(budget.amount)}</strong></p>
      </div>
      <p className="label" style={{ marginTop: "2px", color: over ? "var(--danger)" : "var(--accent)" }}>
        {over ? `⚠️ Over by ${formatKES(Math.abs(remaining))}` : `Remaining: ${formatKES(remaining)}`}
      </p>
    </div>
  );
});

export default function Budget() {
  const { budgets, loading, addB, updateB, deleteB } = useBudget();
  const { transactions }                             = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ category: CATEGORIES[0], amount: "", period: "Monthly", notes: "" });
  const [saving,   setSaving]   = useState(false);
  const [confirm,  setConfirm]  = useState(null);

  // Calculate spent per category from real transactions
  const spentByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => ["purchase","expense"].includes(t.type)).forEach(t => {
      const cat = t.productCategory || "Other";
      const matched = CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase()) || "Other";
      map[matched] = (map[matched] || 0) + (parseFloat(t.amount) || 0);
    });
    return map;
  }, [transactions]);

  const totalBudget = budgets.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
  const totalSpent  = budgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);

  function openAdd() {
    setEditing(null);
    setForm({ category: CATEGORIES[0], amount: "", period: "Monthly", notes: "" });
    setShowForm(true);
  }

  function openEdit(budget) {
    setEditing(budget);
    setForm({ category: budget.category, amount: String(budget.amount), period: budget.period || "Monthly", notes: budget.notes || "" });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.amount) return;
    setSaving(true);
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editing) await updateB(editing.id, data);
      else         await addB(data);
      setShowForm(false);
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    await deleteB(id);
    setConfirm(null);
  }

  if (loading) return <div className="page"><div className="empty-state">Loading budgets…</div></div>;

  return (
    <div className="page">
      {/* Summary */}
      <div className="card balance-row" style={{ padding: "1rem", flexWrap: "wrap" }}>
        <div><p className="label">Total Budget</p><p className="stat">{formatKES(totalBudget)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Total Spent</p><p className="stat down">{formatKES(totalSpent)}</p></div>
        <div className="divider-v" />
        <div><p className="label">Remaining</p><p className={`stat ${totalBudget - totalSpent < 0 ? "down" : "up"}`}>{formatKES(totalBudget - totalSpent)}</p></div>
      </div>

      <button className="btn-primary" style={{ width: "100%" }} onClick={openAdd}>+ Create Budget</button>

      {budgets.length === 0 ? (
        <div className="empty-state">No budgets yet — create one to track your spending!</div>
      ) : (
        budgets.map(b => (
          <BudgetCard
            key={b.id}
            budget={b}
            spent={spentByCategory[b.category] || 0}
            onEdit={openEdit}
            onDelete={(id) => setConfirm(id)}
          />
        ))
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:"1.5rem" }}>
          <div className="card" style={{ width:"100%", maxWidth:"420px" }}>
            <p className="section-title" style={{ marginBottom:"1rem" }}>{editing ? "Edit Budget" : "Create Budget"}</p>
            <form onSubmit={handleSave}>
              <div className="field-row">
                <label className="field-label">Category</label>
                <select className="field-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-row">
                <label className="field-label">Budget amount (KES)</label>
                <input className="field-input" type="number" placeholder="e.g. 50000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="field-row">
                <label className="field-label">Period</label>
                <select className="field-input" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))}>
                  {["Weekly","Monthly","Quarterly","Yearly"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="field-row">
                <label className="field-label">Notes (optional)</label>
                <input className="field-input" type="text" placeholder="Any notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="btn-row" style={{ marginTop:"1rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex:1 }} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:"1.5rem" }}>
          <div className="card" style={{ width:"100%", maxWidth:"340px" }}>
            <p className="section-title">Delete budget?</p>
            <p className="label" style={{ marginTop:"0.5rem" }}>This cannot be undone.</p>
            <div className="btn-row" style={{ marginTop:"1.25rem" }}>
              <button className="btn-secondary" style={{ flex:1 }} onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn-danger"    style={{ flex:1 }} onClick={() => handleDelete(confirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
