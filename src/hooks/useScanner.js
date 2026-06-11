import { useState } from "react";
import { extractReceiptData, fileToBase64 } from "../services/scanner";
import { useTransactions } from "./useTransactions";

const EMPTY_FIELDS = {
  name: "", receiptNo: "", date: "",
  amount: "", vat: "0",
  supplierPin: "", customerPin: "",
  paymentMethod: "cash", productCategory: "",
  transactionType: "sale",
};

export function useScanner() {
  const { addTxn } = useTransactions();
  const [stage,   setStage]   = useState("idle");
  const [fields,  setFields]  = useState(EMPTY_FIELDS);
  const [preview, setPreview] = useState(null);
  const [error,   setError]   = useState("");

  // ── Capture image and run AI extraction ──
  async function captureImage(file) {
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));
    setStage("scanning");

    try {
      const base64   = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";
      const result   = await extractReceiptData(base64, mimeType);
      setFields({ ...EMPTY_FIELDS, ...result });
      setStage("review");
    } catch (err) {
      setError(err.message || "Could not extract fields. Please fill in manually.");
      setFields(EMPTY_FIELDS);
      setStage("review");
    }
  }

  // ── Update a single field ──
  function updateField(key, value) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  // ── Save to Firestore ──
  async function saveTransaction() {
    setStage("saving");
    try {
      await addTxn({
        type:            fields.transactionType,
        name:            fields.name,
        receiptNo:       fields.receiptNo,
        date:            fields.date,
        amount:          parseFloat(fields.amount) || 0,
        vat:             parseFloat(fields.vat)    || 0,
        supplierPin:     fields.supplierPin,
        customerPin:     fields.customerPin,
        paymentMethod:   fields.paymentMethod,
        productCategory: fields.productCategory,
        source:          "scanner",
      });
      setStage("saved");
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
      setStage("review");
    }
  }

  // ── Reset everything ──
  function reset() {
    setStage("idle");
    setFields(EMPTY_FIELDS);
    setPreview(null);
    setError("");
  }

  return {
    stage, fields, preview, error,
    captureImage, updateField, saveTransaction, reset,
  };
}
