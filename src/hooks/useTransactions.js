import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { listenTransactions, addTransaction, deleteTransaction } from "../services/api";
import { groupByDay } from "../utils/dateHelpers";
import { vatSummary } from "../utils/calculateVAT";

// Cache transactions outside component so they survive re-renders
let cachedTxns = [];
let cacheUID   = null;

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(cachedTxns);
  const [loading, setLoading]           = useState(cachedTxns.length === 0);
  const [error,   setError]             = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Already loaded for this user — skip
    if (cacheUID === user.uid && cachedTxns.length > 0) {
      setTransactions(cachedTxns);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = listenTransactions(user.uid, (txns) => {
      cachedTxns = txns;
      cacheUID   = user.uid;
      setTransactions(txns);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const addTxn = useCallback(async (data) => {
    if (!user) throw new Error("Not authenticated");
    return await addTransaction(user.uid, data);
  }, [user]);

  const deleteTxn = useCallback(async (id) => {
    if (!user) throw new Error("Not authenticated");
    return await deleteTransaction(user.uid, id);
  }, [user]);

  // Memoize all computed values so they don't recalculate on every render
  const summary = useMemo(() => {
    const cashIn  = transactions.filter(t => ["sale","banking"].includes(t.type)).reduce((s,t) => s + (parseFloat(t.amount)||0), 0);
    const cashOut = transactions.filter(t => ["purchase","expense"].includes(t.type)).reduce((s,t) => s + (parseFloat(t.amount)||0), 0);
    return {
      cashIn,
      cashOut,
      netCash: cashIn - cashOut,
      vat:     vatSummary(transactions),
      count:   transactions.length,
    };
  }, [transactions]);

  const cashFlowDays = useMemo(() => groupByDay(transactions, 7), [transactions]);

  return { transactions, loading, error, addTxn, deleteTxn, summary, cashFlowDays };
}
