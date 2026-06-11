// Validate KRA PIN format: P + 9 digits + letter (e.g. P051234567X)
export function isValidKRAPin(pin) {
    if (!pin) return false;
    return /^[A-Z]\d{9}[A-Z]$/.test(pin.toUpperCase());
  }
  
  // Validate Kenyan phone number
  export function isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-+]/g, "");
    return /^(254|0)[17]\d{8}$/.test(cleaned);
  }
  
  // Validate amount is a positive number
  export function isValidAmount(amount) {
    const n = parseFloat(amount);
    return !isNaN(n) && n > 0;
  }
  
  // Validate receipt/invoice number (not empty, min 3 chars)
  export function isValidReceiptNo(ref) {
    return ref && String(ref).trim().length >= 3;
  }
  
  // Normalize phone to 254XXXXXXXXX format
  export function normalizePhone(phone) {
    const cleaned = phone.replace(/[\s\-+]/g, "");
    if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
    return cleaned;
  }
  