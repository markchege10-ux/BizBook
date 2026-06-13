import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { listenBudgets, addBudget, updateBudget, deleteBudget } from "../services/budget";

export function useBudget() {
  const { user }              = useAuth();
  const [budgets,  setBudgets]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const unsub = listenBudgets(user.uid, (data) => {
      setBudgets(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const addB    = useCallback((data)           => addBudget(user.uid, data),             [user?.uid]);
  const updateB = useCallback((id, data)       => updateBudget(user.uid, id, data),      [user?.uid]);
  const deleteB = useCallback((id)             => deleteBudget(user.uid, id),             [user?.uid]);

  return { budgets, loading, addB, updateB, deleteB };
}
