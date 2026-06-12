import {
  collection, addDoc, query, where, orderBy,
  serverTimestamp, doc, updateDoc, deleteDoc,
  onSnapshot, limit, getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

// ── Add a transaction ──
export async function addTransaction(userId, data) {
  const ref = collection(db, "users", userId, "transactions");
  return await addDoc(ref, {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ── Real-time listener — limited to last 100 transactions ──
export function listenTransactions(userId, callback) {
  const ref = collection(db, "users", userId, "transactions");
  const q   = query(ref, orderBy("createdAt", "desc"), limit(100));

  return onSnapshot(q,
    { includeMetadataChanges: false }, // ignore cache-only changes
    (snap) => {
      const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(txns);
    }
  );
}

// ── Update a transaction ──
export async function updateTransaction(userId, txnId, data) {
  const ref = doc(db, "users", userId, "transactions", txnId);
  return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// ── Delete a transaction ──
export async function deleteTransaction(userId, txnId) {
  const ref = doc(db, "users", userId, "transactions", txnId);
  return await deleteDoc(ref);
}

// ── Save/update user profile ──
export async function updateUserProfile(userId, data) {
  const ref = doc(db, "users", userId);
  return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// ── Get user profile once ──
export async function getUserProfile(userId) {
  const ref  = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
