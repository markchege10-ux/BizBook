import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { listenTransactions, addTransaction, deleteTransaction } from "../services/api";
import { groupByDay } from "../utils/dateHelpers";
import { vatSummary } from "../utils/calculateVAT";

// Module-level cache — persists between navigations
const cache = { uid: null, txns: [], unsub: null };

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(cache.txns);
  const [loading, setLoading]           = useState(cache.txns.length === 0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!user) { setLoading(false); return; }

    // Reuse existing listener for same user
    if (cache.uid === user.uid && cache.unsub) {
      setTransactions(cache.txns);
      setLoading(false);
      return;
    }

    // Clean up old listener
    if (cache.unsub) { cache.unsub(); cache.unsub = null; }

    cache.uid  = user.uid;
    setLoading(true);

    cache.unsub = listenTransactions(user.uid, (txns) => {
      cache.txns = txns;
      if (mounted.current) {
        setTransactions(txns);
        setLoading(false);
      }
    });

    return () => { mounted.current = false; };
  }, [user?.uid]);

  const addTxn = useCallback(async (data) => {
    if (!user) throw new Error("Not authenticated");
    return await addTransaction(user.uid, data);
  }, [user?.uid]);

  const deleteTxn = useCallback(async (id) => {
    if (!user) throw new Error("Not authenticated");
    return await deleteTransaction(user.uid, id);
  }, [user?.uid]);

  const summary = useMemo(() => {
    const cashIn  = transactions.filter(t => ["sale","banking"].includes(t.type)).reduce((s,t) => s+(parseFloat(t.amount)||0), 0);
    const cashOut = transactions.filter(t => ["purchase","expense"].includes(t.type)).reduce((s,t) => s+(parseFloat(t.amount)||0), 0);
    return { cashIn, cashOut, netCash: cashIn - cashOut, vat: vatSummary(transactions), count: transactions.length };
  }, [transactions]);

  const cashFlowDays = useMemo(() => groupByDay(transactions, 7), [transactions]);

  return { transactions, loading, addTxn, deleteTxn, summary, cashFlowDays };
}
