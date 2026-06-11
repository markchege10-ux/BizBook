// Format number as KES currency
export function formatKES(amount) {
    if (amount === null || amount === undefined) return "KES 0";
    return "KES " + Number(amount).toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  
  // Format with /- suffix (Kenyan style)
  export function formatKESFull(amount) {
    return formatKES(amount) + "/-";
  }
  
  // Parse string to number safely
  export function parseAmount(str) {
    if (!str) return 0;
    return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
  }
  