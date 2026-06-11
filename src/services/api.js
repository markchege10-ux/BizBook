import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    limit,
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
  
  // ── Get all transactions for user (one-time fetch) ──
  export async function getTransactions(userId, filters = {}) {
    const ref  = collection(db, "users", userId, "transactions");
    const constraints = [orderBy("createdAt", "desc")];
  
    if (filters.type)      constraints.push(where("type", "==", filters.type));
    if (filters.limit)     constraints.push(limit(filters.limit));
  
    const snap = await getDocs(query(ref, ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  
  // ── Real-time listener for transactions ──
  export function listenTransactions(userId, callback, filters = {}) {
    const ref = collection(db, "users", userId, "transactions");
    const constraints = [orderBy("createdAt", "desc")];
    if (filters.limit) constraints.push(limit(filters.limit));
  
    return onSnapshot(query(ref, ...constraints), snap => {
      const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(txns);
    });
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
  