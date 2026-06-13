import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase/config";

// ── Clients (businesses managed by accountant) ──
export function listenClients(userId, callback) {
  const ref = collection(db, "users", userId, "clients");
  const q   = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, { includeMetadataChanges: false }, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addClient(userId, data) {
  const ref = collection(db, "users", userId, "clients");
  return await addDoc(ref, { ...data, createdAt: serverTimestamp() });
}

export async function updateClient(userId, clientId, data) {
  return await updateDoc(doc(db, "users", userId, "clients", clientId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteClient(userId, clientId) {
  return await deleteDoc(doc(db, "users", userId, "clients", clientId));
}

// ── Accountant access requests ──
export async function requestAccountantAccess(clientUID, accountantEmail, accountantUID) {
  const ref = collection(db, "accessRequests");
  return await addDoc(ref, {
    clientUID, accountantEmail, accountantUID,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function listenAccessRequests(userId, callback) {
  const ref = collection(db, "accessRequests");
  const q   = query(ref, where("clientUID", "==", userId));
  return onSnapshot(q, { includeMetadataChanges: false }, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
