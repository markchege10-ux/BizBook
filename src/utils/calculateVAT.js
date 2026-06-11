const VAT_RATE = 0.16; // Kenya standard VAT rate 16%

// Calculate VAT from gross amount (VAT inclusive)
export function vatFromGross(grossAmount) {
  const amount = parseFloat(grossAmount) || 0;
  return parseFloat((amount * VAT_RATE / (1 + VAT_RATE)).toFixed(2));
}

// Calculate VAT from net amount (VAT exclusive)
export function vatFromNet(netAmount) {
  const amount = parseFloat(netAmount) || 0;
  return parseFloat((amount * VAT_RATE).toFixed(2));
}

// Get net from gross
export function netFromGross(grossAmount) {
  const amount = parseFloat(grossAmount) || 0;
  return parseFloat((amount / (1 + VAT_RATE)).toFixed(2));
}

// Summary: output VAT (from sales) - input VAT (from purchases) = payable
export function vatSummary(transactions) {
  const sales     = transactions.filter(t => t.type === "sale");
  const purchases = transactions.filter(t => t.type === "purchase");

  const outputVAT = sales.reduce((s, t) => s + (parseFloat(t.vat) || 0), 0);
  const inputVAT  = purchases.reduce((s, t) => s + (parseFloat(t.vat) || 0), 0);
  const payable   = Math.max(0, outputVAT - inputVAT);

  return {
    outputVAT: parseFloat(outputVAT.toFixed(2)),
    inputVAT:  parseFloat(inputVAT.toFixed(2)),
    payable:   parseFloat(payable.toFixed(2)),
  };
}
