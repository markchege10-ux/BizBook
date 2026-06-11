import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { listenTransactions, addTransaction, deleteTransaction } from "../services/api";
import { groupByDay } from "../utils/dateHelpers";
import { vatSummary } from "../utils/calculateVAT";

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsub = listenTransactions(user.uid, (txns) => {
      setTransactions(txns);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // ── Add new transaction ──
  const addTxn = useCallback(async (data) => {
    if (!user) throw new Error("Not authenticated");
    return await addTransaction(user.uid, data);
  }, [user]);

  // ── Delete transaction ──
  const deleteTxn = useCallback(async (id) => {
    if (!user) throw new Error("Not authenticated");
    return await deleteTransaction(user.uid, id);
  }, [user]);

  // ── Computed summaries ──
  const summary = {
    cashIn:  transactions.filter(t => ["sale","banking"].includes(t.type)).reduce((s,t) => s + (parseFloat(t.amount)||0), 0),
    cashOut: transactions.filter(t => ["purchase","expense"].includes(t.type)).reduce((s,t) => s + (parseFloat(t.amount)||0), 0),
    get netCash() { return this.cashIn - this.cashOut; },
    vat:     vatSummary(transactions),
    count:   transactions.length,
  };

  // ── Cash flow by day (last 7 days) ──
  const cashFlowDays = groupByDay(transactions, 7);

  return {
    transactions,
    loading,
    error,
    addTxn,
    deleteTxn,
    summary,
    cashFlowDays,
  };
}
