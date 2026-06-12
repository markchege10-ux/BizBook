// ETR (Electronic Tax Register) Service
// Handles ETR receipt generation and validation for KRA compliance

// ETR receipt number format: ETR-YYYYMMDD-XXXX
export function generateETRNumber() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ETR-${y}${m}${d}-${rand}`;
  }
  
  // Validate ETR receipt number format
  export function isValidETRNumber(ref) {
    return /^ETR-\d{8}-\d{4}$/.test(ref);
  }
  
  // Build ETR receipt data structure
  export function buildETRReceipt({ name, amount, vat, supplierPin, customerPin, paymentMethod, items = [] }) {
    return {
      etrNo:         generateETRNumber(),
      issueDate:     new Date().toISOString().split("T")[0],
      issueTime:     new Date().toTimeString().split(" ")[0],
      sellerName:    name,
      sellerPin:     supplierPin  || "",
      buyerPin:      customerPin  || "",
      paymentMethod: paymentMethod || "cash",
      taxableAmount: parseFloat(amount) - parseFloat(vat || 0),
      vatAmount:     parseFloat(vat    || 0),
      totalAmount:   parseFloat(amount || 0),
      items,
      status:        "issued",
    };
  }
  
  // Format ETR receipt for display
  export function formatETRReceipt(receipt) {
    return `
  ETR RECEIPT
  ====================
  ETR No:    ${receipt.etrNo}
  Date:      ${receipt.issueDate}
  Time:      ${receipt.issueTime}
  --------------------
  Seller:    ${receipt.sellerName}
  PIN:       ${receipt.sellerPin || "N/A"}
  --------------------
  Taxable:   KES ${receipt.taxableAmount.toLocaleString()}
  VAT 16%:   KES ${receipt.vatAmount.toLocaleString()}
  TOTAL:     KES ${receipt.totalAmount.toLocaleString()}
  --------------------
  Payment:   ${receipt.paymentMethod.toUpperCase()}
  ====================
    `.trim();
  }
  
  // Calculate 16% VAT from gross amount
  export function calcVATFromGross(gross) {
    const amount = parseFloat(gross) || 0;
    return parseFloat((amount * 16 / 116).toFixed(2));
  }
  
  // Calculate taxable amount from gross
  export function calcTaxableFromGross(gross) {
    const amount = parseFloat(gross) || 0;
    return parseFloat((amount * 100 / 116).toFixed(2));
  }
  