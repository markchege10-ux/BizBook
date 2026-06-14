import { useState, useEffect, memo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { listenClients, addClient, updateClient, deleteClient } from "../services/clients";

const EMPTY_FORM = {
  businessName: "", contactName: "", phone: "",
  email: "", kraPin: "", type: "Client", industry: "", notes: "",
};

const ClientCard = memo(({ client, onEdit, onDelete, onView }) => (
  <div className="card" style={{ padding: "1.1rem", cursor: "pointer" }} onClick={() => onView(client)}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.businessName}</p>
        <p className="label">{client.contactName}{client.phone ? ` · ${client.phone}` : ""}</p>
        {client.kraPin && <p className="label">KRA: {client.kraPin}</p>}
      </div>
      <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
        <button className="link-btn" onClick={e => { e.stopPropagation(); onEdit(client); }}>Edit</button>
        <button style={{ fontSize: "12px", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
          onClick={e => { e.stopPropagation(); onDelete(client.id); }}>Delete</button>
      </div>
    </div>
    <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
      <span className="badge badge-green">{client.type || "Client"}</span>
      {client.industry && (
        <span className="badge" style={{ background: "var(--blue-dim)", color: "var(--blue)", border: "0.5px solid rgba(79,156,249,0.25)" }}>
          {client.industry}
        </span>
      )}
    </div>
  </div>
));

export default function Clients() {
  const { user }                    = useAuth();
  const [clients,  setClients]      = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing,  setEditing]      = useState(null);
  const [viewing,  setViewing]      = useState(null);
  const [form,     setForm]         = useState(EMPTY_FORM);
  const [saving,   setSaving]       = useState(false);
  const [confirm,  setConfirm]      = useState(null);
  const [search,   setSearch]       = useState("");
  const [success,  setSuccess]      = useState("");
  const [error,    setError]        = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = listenClients(user.uid, (data) => {
      setClients(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const filtered = clients.filter(c =>
    !search || [c.businessName, c.contactName, c.phone, c.kraPin]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSuccess("");
    setError("");
    setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      businessName: c.businessName || "",
      contactName:  c.contactName  || "",
      phone:        c.phone        || "",
      email:        c.email        || "",
      kraPin:       c.kraPin       || "",
      type:         c.type         || "Client",
      industry:     c.industry     || "",
      notes:        c.notes        || "",
    });
    setSuccess("");
    setError("");
    setShowForm(true);
  }

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateClient(user.uid, editing.id, form);
      } else {
        await addClient(user.uid, form);
      }
      // ✅ Reset immediately after save — don't wait for listener
      setSaving(false);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      setSuccess(editing ? "Client updated!" : "Client added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setSaving(false);
      setError("Failed to save. Please try again.");
    }
  }

  async function handleDelete(id) {
    await deleteClient(user.uid, id);
    setConfirm(null);
    if (viewing?.id === id) setViewing(null);
  }

  if (loading) return <div className="page"><div className="empty-state">Loading clients…</div></div>;

  // ── Client detail view ──
  if (viewing) return (
    <div className="page">
      <button className="link-btn" onClick={() => setViewing(null)}>← Back to clients</button>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <p style={{ fontWeight: 700, fontSize: "18px" }}>{viewing.businessName}</p>
          <span className="badge badge-green">{viewing.type}</span>
        </div>
        <div style={{ marginTop: "1rem" }}>
          {[
            { label: "Contact name", value: viewing.contactName },
            { label: "Phone",        value: viewing.phone },
            { label: "Email",        value: viewing.email },
            { label: "KRA PIN",      value: viewing.kraPin },
            { label: "Industry",     value: viewing.industry },
            { label: "Notes",        value: viewing.notes },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="detail-row">
              <span className="label">{f.label}</span>
              <span style={{ fontSize: "13px", color: "var(--text)" }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="btn-row">
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { openEdit(viewing); setViewing(null); }}>Edit</button>
        <button className="btn-danger"    style={{ flex: 1 }} onClick={() => { setConfirm(viewing.id); setViewing(null); }}>Delete</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Success toast */}
      {success && <div className="auth-success">✅ {success}</div>}

      <div className="btn-row">
        <input
          className="search-input"
          style={{ flex: 1 }}
          placeholder="🔍 Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-primary" style={{ whiteSpace: "nowrap" }} onClick={openAdd}>+ Add client</button>
      </div>

      <p className="label">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {clients.length === 0 ? "No clients yet — add your first client!" : "No results found."}
        </div>
      ) : (
        filtered.map(c => (
          <ClientCard
            key={c.id}
            client={c}
            onEdit={openEdit}
            onDelete={id => setConfirm(id)}
            onView={setViewing}
          />
        ))
      )}

      {/* ── Add / Edit modal ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1.5rem", overflowY: "auto" }}>
          <div className="card" style={{ width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto" }}>
            <p className="section-title" style={{ marginBottom: "1rem" }}>
              {editing ? "Edit client" : "Add client"}
            </p>

            {error && <div className="auth-error" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}

            <form onSubmit={handleSave}>
              {[
                { label: "Business name *", key: "businessName", type: "text",  placeholder: "Kamau Traders Ltd",         required: true },
                { label: "Contact name",    key: "contactName",  type: "text",  placeholder: "James Kamau" },
                { label: "Phone",           key: "phone",        type: "tel",   placeholder: "+254 7XX XXX XXX" },
                { label: "Email",           key: "email",        type: "email", placeholder: "info@example.co.ke" },
                { label: "KRA PIN",         key: "kraPin",       type: "text",  placeholder: "P051234567X" },
                { label: "Industry",        key: "industry",     type: "text",  placeholder: "e.g. Retail, Manufacturing" },
              ].map(f => (
                <div key={f.key} className="field-row">
                  <label className="field-label">{f.label}</label>
                  <input
                    className="field-input"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => updateField(f.key, e.target.value)}
                    required={f.required}
                  />
                </div>
              ))}

              <div className="field-row">
                <label className="field-label">Type</label>
                <select className="field-input" value={form.type} onChange={e => updateField("type", e.target.value)}>
                  {["Client", "Supplier", "Both"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="field-row">
                <label className="field-label">Notes</label>
                <input className="field-input" type="text" placeholder="Any notes…" value={form.notes} onChange={e => updateField("notes", e.target.value)} />
              </div>

              <div className="btn-row" style={{ marginTop: "1.25rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditing(null); setError(""); }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? "Saving…" : editing ? "Update client" : "Save client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1.5rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "340px" }}>
            <p className="section-title">Delete client?</p>
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
