// Format a Firestore timestamp or JS Date to readable string
export function formatDate(ts) {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  }
  
  // Format to YYYY-MM-DD
  export function toISODate(ts) {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split("T")[0];
  }
  
  // Get start of day
  export function startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  // Get start of current month
  export function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  
  // Get day label e.g. "Mon", "Tue"
  export function getDayLabel(date) {
    return new Date(date).toLocaleDateString("en-KE", { weekday: "short" });
  }
  
  // Group transactions by day (last N days)
  export function groupByDay(transactions, days = 7) {
    const result = [];
    const today  = new Date();
  
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toISODate(d);
      const label   = getDayLabel(d);
  
      const dayTxns = transactions.filter(t => {
        const txDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        return toISODate(txDate) === dateStr;
      });
  
      const cashIn  = dayTxns.filter(t => ["sale", "banking"].includes(t.type)).reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const cashOut = dayTxns.filter(t => ["purchase", "expense"].includes(t.type)).reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  
      result.push({ date: dateStr, label, cashIn, cashOut });
    }
    return result;
  }
  