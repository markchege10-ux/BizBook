import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export function listenBudgets(userId, callback) {
  const ref = collection(db, "users", userId, "budgets");
  const q   = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, { includeMetadataChanges: false }, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addBudget(userId, data) {
  const ref = collection(db, "users", userId, "budgets");
  return await addDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateBudget(userId, budgetId, data) {
  const ref = doc(db, "users", userId, "budgets", budgetId);
  return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteBudget(userId, budgetId) {
  return await deleteDoc(doc(db, "users", userId, "budgets", budgetId));
}
