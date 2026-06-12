import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../hooks/useTransactions";
import { uploadReceiptAsset, getUserReceipts, verifyReceipt } from "../services/marketplace";

const USE_CASES = [
  { key: "proofOfPurchase",      label: "Proof of purchase",    icon: "✅" },
  { key: "supplierVerification", label: "Supplier verification", icon: "🔍" },
  { key: "creditAssessment",     label: "Credit assessment",    icon: "💳" },
  { key: "procurementRecord",    label: "Procurement record",   icon: "📋" },
];

export default function Receipts() {
  const { user, profile } = useAuth();
  const { transactions }  = useTransactions();
  const [tab,       setTab]       = useState("my");
  const [uploaded,  setUploaded]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(null);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");

  // Load user's uploaded receipts
  useEffect(() => {
    if (!user || tab !== "uploaded") return;
    setLoading(true);
    getUserReceipts(user.uid)
      .then(setUploaded)
      .catch(() => setError("Failed to load receipts."))
      .finally(() => setLoading(false));
  }, [user, tab]);

  async function handleUpload(txn) {
    setUploading(txn.id); setError(""); setSuccess("");
    try {
      await uploadReceiptAsset(user.uid, txn, profile?.businessName ?? "");
      setSuccess(`Receipt ${txn.receiptNo || txn.name} uploaded to marketplace!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  async function handleVerify(receiptId) {
    try {
      await verifyReceipt(receiptId, user.uid);
      setUploaded(prev => prev.map(r => r.id === receiptId ? { ...r, verified: true } : r));
    } catch {
      setError("Verification failed.");
    }
  }

  const uploadableReceipts = transactions.filter(t => t.type === "sale" || t.type === "purchase");

  return (
    <div className="page">
      <div className="tab-row">
        {[
          { id: "my",       label: "My Receipts" },
          { id: "uploaded", label: "Marketplace" },
          { id: "uses",     label: "Use Cases" },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {error   && <div className="auth-error">⚠️ {error}</div>}
      {success && <div className="auth-success">✅ {success}</div>}

      {/* ── MY RECEIPTS ── */}
      {tab === "my" && (
        <>
          <div className="alert-banner" style={{ background: "rgba(79,156,249,0.08)", borderColor: "rgba(79,156,249,0.2)" }}>
            <span>ℹ️</span>
            <div>
              <p className="alert-title" style={{ color: "var(--blue)" }}>Receipt marketplace</p>
              <p className="alert-sub">Upload your receipts as verified digital assets</p>
            </div>
          </div>

          {uploadableReceipts.length === 0 ? (
            <div className="empty-state">No receipts yet — scan or add transactions first.</div>
          ) : (
            uploadableReceipts.map((txn) => (
              <div key={txn.id} className="txn-item">
                <span className="txn-icon">{txn.type === "sale" ? "🛍️" : "📦"}</span>
                <div className="txn-info">
                  <p className="txn-name">{txn.name || "Unnamed"}</p>
                  <p className="txn-meta">{txn.date} · KES {(txn.amount || 0).toLocaleString()}</p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: "12px", padding: "6px 12px", whiteSpace: "nowrap" }}
                  onClick={() => handleUpload(txn)}
                  disabled={uploading === txn.id}
                >
                  {uploading === txn.id ? "…" : "↑ Upload"}
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* ── MARKETPLACE ── */}
      {tab === "uploaded" && (
        <>
          {loading ? (
            <div className="empty-state">Loading…</div>
          ) : uploaded.length === 0 ? (
            <div className="card scan-area">
              <div style={{ fontSize: "40px" }}>🏪</div>
              <p className="scan-title">No receipts uploaded yet</p>
              <p className="scan-sub">Upload receipts from "My Receipts" tab to list them here</p>
            </div>
          ) : (
            uploaded.map((r) => (
              <div key={r.id} className="txn-item">
                <span className="txn-icon">{r.type === "sale" ? "🛍️" : "📦"}</span>
                <div className="txn-info">
                  <p className="txn-name">{r.supplierName || r.receiptNo || "Receipt"}</p>
                  <p className="txn-meta">{r.date} · KES {(r.amount || 0).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span className={`badge ${r.verified ? "badge-green" : "badge-warn"}`}>
                    {r.verified ? "✓ Verified" : "Pending"}
                  </span>
                  {!r.verified && (
                    <button className="link-btn" onClick={() => handleVerify(r.id)}>Verify</button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── USE CASES ── */}
      {tab === "uses" && (
        <>
          <div className="card">
            <p className="section-title">What receipts are used for</p>
            <p className="label" style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>
              Digital receipts on the marketplace serve as verified proof for:
            </p>
            {USE_CASES.map((u) => (
              <div key={u.key} className="txn-item" style={{ marginTop: "0.75rem" }}>
                <span className="txn-icon">{u.icon}</span>
                <div className="txn-info">
                  <p className="txn-name">{u.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <p className="section-title">Legal & tax compliance</p>
            <p className="label" style={{ marginTop: "0.5rem", lineHeight: 1.7 }}>
              All receipts uploaded to the marketplace must comply with KRA ETR requirements.
              Businesses uploading receipts confirm they are genuine transaction records.
              Marketplace receipts require legal and tax compliance verification before use
              for credit assessment or procurement.
            </p>
            <div className="badge badge-warn" style={{ marginTop: "1rem" }}>
              ⚠️ Legal & tax compliance required
            </div>
          </div>
        </>
      )}
    </div>
  );
}
