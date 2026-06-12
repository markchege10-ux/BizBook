// KRA / eTIMS Integration Service
// Handles VAT reporting, tax summaries and eTIMS invoice reading

// VAT return periods
export function getVATReturnPeriod() {
    const now   = new Date();
    const month = now.toLocaleDateString("en-KE", { month: "long" });
    const year  = now.getFullYear();
    const due   = new Date(now.getFullYear(), now.getMonth() + 1, 20);
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return { month, year, dueDate: due.toISOString().split("T")[0], daysLeft };
  }
  
  // Build VAT return summary from transactions
  export function buildVATReturn(transactions) {
    const period  = getVATReturnPeriod();
    const sales   = transactions.filter(t => t.type === "sale");
    const purchases = transactions.filter(t => t.type === "purchase");
  
    const outputVAT  = sales.reduce((s, t)     => s + (parseFloat(t.vat) || 0), 0);
    const inputVAT   = purchases.reduce((s, t) => s + (parseFloat(t.vat) || 0), 0);
    const netVAT     = outputVAT - inputVAT;
    const vatPayable = Math.max(0, netVAT);
    const vatCredit  = Math.max(0, -netVAT);
  
    const totalSales     = sales.reduce((s, t)     => s + (parseFloat(t.amount) || 0), 0);
    const totalPurchases = purchases.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  
    return {
      period,
      totalSales:     parseFloat(totalSales.toFixed(2)),
      totalPurchases: parseFloat(totalPurchases.toFixed(2)),
      outputVAT:      parseFloat(outputVAT.toFixed(2)),
      inputVAT:       parseFloat(inputVAT.toFixed(2)),
      vatPayable:     parseFloat(vatPayable.toFixed(2)),
      vatCredit:      parseFloat(vatCredit.toFixed(2)),
      transactionCount: transactions.length,
      salesCount:     sales.length,
      purchasesCount: purchases.length,
    };
  }
  
  // Validate KRA PIN
  export function validateKRAPin(pin) {
    if (!pin) return { valid: false, message: "PIN is required" };
    const cleaned = pin.toUpperCase().trim();
    if (!/^[A-Z]\d{9}[A-Z]$/.test(cleaned))
      return { valid: false, message: "Invalid KRA PIN format. Example: P051234567X" };
    return { valid: true, message: "Valid KRA PIN" };
  }
  
  // Generate tax summary report
  export function generateTaxSummary(transactions, businessName, kraPin) {
    const vatReturn = buildVATReturn(transactions);
    const period    = getVATReturnPeriod();
  
    return {
      reportTitle:  "VAT Return Report",
      businessName: businessName || "N/A",
      kraPin:       kraPin       || "N/A",
      period:       `${period.month} ${period.year}`,
      dueDate:      period.dueDate,
      ...vatReturn,
      generatedAt:  new Date().toISOString(),
    };
  }
  
  // Parse eTIMS invoice data (for reading supplier invoices)
  export function parseETIMSInvoice(rawData) {
    try {
      return {
        invoiceNo:    rawData.invoiceNo    || rawData.receiptNo || "",
        supplierName: rawData.supplierName || rawData.name      || "",
        supplierPin:  rawData.supplierPin  || rawData.pin       || "",
        date:         rawData.date         || "",
        amount:       parseFloat(rawData.amount || rawData.total || 0),
        vat:          parseFloat(rawData.vat    || rawData.vatAmount || 0),
        items:        rawData.items        || [],
        status:       "read",
      };
    } catch {
      return null;
    }
  }
  