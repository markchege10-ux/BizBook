import { useState, useRef } from "react";

const FIELDS = [
  { key: "name", label: "Supplier / Customer name" },
  { key: "receiptNo", label: "Receipt / Invoice no." },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount (KES)" },
  { key: "vat", label: "VAT amount (KES)" },
  { key: "pin", label: "Supplier PIN" },
];

export default function Scanner() {
  const [stage, setStage] = useState("idle"); // idle | scanning | review | saved
  const [fields, setFields] = useState({ name: "", receiptNo: "", date: "", amount: "", vat: "", pin: "" });
  const [type, setType] = useState("sale"); // sale | purchase
  const fileRef = useRef();

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStage("scanning");
    // Simulate AI extraction delay
    setTimeout(() => {
      setFields({
        name: "Unga Group Ltd",
        receiptNo: "ETR-20260607-4821",
        date: "2026-06-07",
        amount: "12500",
        vat: "1938",
        pin: "P051234567X",
      });
      setStage("review");
    }, 1800);
  };

  const handleSave = () => {
    // TODO: call transactionStore.addTransaction({ type, ...fields })
    setStage("saved");
    setTimeout(() => {
      setStage("idle");
      setFields({ name: "", receiptNo: "", date: "", amount: "", vat: "", pin: "" });
    }, 2000);
  };

  return (
    <div className="page">
      {/* Type toggle */}
      <div className="segment-control">
        {["sale", "purchase"].map((t) => (
          <button
            key={t}
            className={`segment-btn ${type === t ? "active" : ""}`}
            onClick={() => setType(t)}
          >
            {t === "sale" ? "📊 Sale" : "📦 Purchase"}
          </button>
        ))}
      </div>

      {/* Idle: capture prompt */}
      {stage === "idle" && (
        <div className="card scan-area" onClick={() => fileRef.current.click()}>
          <div className="scan-icon">📷</div>
          <p className="scan-title">Tap to scan receipt or invoice</p>
          <p className="scan-sub">AI will extract all fields automatically</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleCapture}
          />
        </div>
      )}

      {/* Scanning: loading */}
      {stage === "scanning" && (
        <div className="card scan-area">
          <div className="scan-spinner">⏳</div>
          <p className="scan-title">Extracting fields with AI…</p>
          <p className="scan-sub">Reading receipt details</p>
        </div>
      )}

      {/* Review: editable fields */}
      {(stage === "review" || stage === "saved") && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "1rem" }}>
            Review &amp; confirm
          </p>
          {FIELDS.map((f) => (
            <div key={f.key} className="field-row">
              <label className="field-label">{f.label}</label>
              <input
                className="field-input"
                value={fields[f.key]}
                onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
                placeholder={`Enter ${f.label.toLowerCase()}`}
              />
            </div>
          ))}

          {stage === "saved" ? (
            <div className="save-success">✅ Saved successfully!</div>
          ) : (
            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setStage("idle")}>Retake</button>
              <button className="btn-primary" onClick={handleSave}>Save {type}</button>
            </div>
          )}
        </div>
      )}

      {/* Manual entry fallback */}
      {stage === "idle" && (
        <button className="link-btn center" onClick={() => setStage("review")}>
          + Enter manually instead
        </button>
      )}
    </div>
  );
}
