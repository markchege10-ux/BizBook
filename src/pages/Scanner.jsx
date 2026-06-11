import { useRef, useState } from "react";
import { useScanner } from "../hooks/useScanner";

const PAYMENT_METHODS = ["cash", "mpesa", "bank", "cheque", "card"];

const FIELDS = [
  { key: "name",            label: "Supplier / Customer name",   type: "text",   placeholder: "e.g. Unga Group Ltd" },
  { key: "receiptNo",       label: "Receipt / Invoice no.",      type: "text",   placeholder: "e.g. ETR-2026-4821" },
  { key: "date",            label: "Date",                       type: "date",   placeholder: "" },
  { key: "amount",          label: "Amount (KES)",               type: "number", placeholder: "e.g. 12500" },
  { key: "vat",             label: "VAT amount (KES)",           type: "number", placeholder: "e.g. 1938" },
  { key: "supplierPin",     label: "Supplier KRA PIN",           type: "text",   placeholder: "e.g. P051234567X" },
  { key: "customerPin",     label: "Customer KRA PIN",           type: "text",   placeholder: "Optional" },
  { key: "productCategory", label: "Product / Service category", type: "text",   placeholder: "e.g. groceries, transport" },
];

export default function Scanner() {
  const {
    stage, fields, preview, error,
    captureImage, updateField, saveTransaction, reset,
  } = useScanner();

  const cameraRef = useRef();  // for rear camera (capture)
  const galleryRef = useRef(); // for gallery / manual
  const [manualMode, setManualMode] = useState(false);

  function handleCameraFile(e) {
    const file = e.target.files[0];
    if (file) captureImage(file);
  }

  function handleManual() {
    setManualMode(true);
    reset();
    // skip to review with empty fields
    updateField("transactionType", fields.transactionType);
  }

  return (
    <div className="page">

      {/* Transaction type toggle */}
      <div className="segment-control">
        {["sale", "purchase"].map((t) => (
          <button
            key={t}
            className={`segment-btn ${fields.transactionType === t ? "active" : ""}`}
            onClick={() => updateField("transactionType", t)}
          >
            {t === "sale" ? "📊 Sale / ETR" : "📦 Purchase"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="auth-error">⚠️ {error}</div>}

      {/* ── IDLE ── */}
      {stage === "idle" && !manualMode && (
        <>
          {/* Camera button — opens rear camera directly */}
          <div
            className="card scan-area"
            onClick={() => cameraRef.current.click()}
            style={{ cursor: "pointer" }}
          >
            <div className="scan-icon">📷</div>
            <p className="scan-title">Tap to open camera</p>
            <p className="scan-sub">Point at receipt or invoice — AI extracts all fields</p>

            {/* Rear camera input */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleCameraFile}
            />
          </div>

          {/* Gallery / upload option */}
          <button
            className="btn-secondary"
            style={{ width: "100%" }}
            onClick={() => galleryRef.current.click()}
          >
            🖼️ Choose from gallery
          </button>

          {/* Gallery input — no capture attribute so it opens gallery */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCameraFile}
          />

          {/* Manual entry */}
          <button className="link-btn center" onClick={handleManual}>
            ✏️ Enter manually instead
          </button>
        </>
      )}

      {/* ── SCANNING (AI processing) ── */}
      {stage === "scanning" && (
        <div className="card scan-area">
          {preview && (
            <img
              src={preview}
              alt="Captured receipt"
              style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", marginBottom: "1rem" }}
            />
          )}
          <div className="scan-spinner">🤖</div>
          <p className="scan-title">AI is reading your receipt…</p>
          <p className="scan-sub">Extracting name, amount, VAT, PIN and more</p>
        </div>
      )}

      {/* ── REVIEW (editable fields) ── */}
      {(stage === "review" || stage === "saving" || manualMode) && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>
            {manualMode ? "Enter details manually" : error ? "Fill in details" : "Review & confirm"}
          </p>

          {preview && !manualMode && (
            <img
              src={preview}
              alt="Receipt"
              style={{ width: "100%", maxHeight: "160px", objectFit: "contain", borderRadius: "8px", marginBottom: "1rem" }}
            />
          )}

          {FIELDS.map((f) => (
            <div key={f.key} className="field-row">
              <label className="field-label">{f.label}</label>
              <input
                className="field-input"
                type={f.type}
                placeholder={f.placeholder}
                value={fields[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
              />
            </div>
          ))}

          {/* Payment method */}
          <div className="field-row">
            <label className="field-label">Payment method</label>
            <div className="tab-row">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  className={`tab-btn ${fields.paymentMethod === m ? "active" : ""}`}
                  onClick={() => updateField("paymentMethod", m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: "1.25rem" }}>
            <button
              className="btn-secondary"
              onClick={() => { reset(); setManualMode(false); }}
              disabled={stage === "saving"}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={saveTransaction}
              disabled={stage === "saving" || !fields.amount}
            >
              {stage === "saving" ? "Saving…" : `Save ${fields.transactionType}`}
            </button>
          </div>
        </div>
      )}

      {/* ── SAVED ── */}
      {stage === "saved" && (
        <div className="card scan-area">
          <div style={{ fontSize: "52px" }}>✅</div>
          <p className="scan-title">Transaction saved!</p>
          <p className="scan-sub">Added to your books successfully</p>
          <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => { reset(); setManualMode(false); }}>
            Scan another
          </button>
        </div>
      )}
    </div>
  );
}
