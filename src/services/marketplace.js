// Receipt Trading Marketplace Service
// Handles uploading receipts as digital assets and verification

import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Upload a receipt as a digital asset to the marketplace
export async function uploadReceiptAsset(userId, transactionData, businessName) {
  const ref = collection(db, "marketplace");
  return await addDoc(ref, {
    uploadedBy:   userId,
    businessName: businessName || "",
    receiptNo:    transactionData.receiptNo  || "",
    supplierName: transactionData.name       || "",
    supplierPin:  transactionData.supplierPin || "",
    customerPin:  transactionData.customerPin || "",
    amount:       parseFloat(transactionData.amount) || 0,
    vat:          parseFloat(transactionData.vat)    || 0,
    date:         transactionData.date       || "",
    type:         transactionData.type       || "sale",
    category:     transactionData.productCategory || "",
    uses: {
      proofOfPurchase:    false,
      supplierVerification: false,
      creditAssessment:   false,
      procurementRecord:  false,
    },
    verified:    false,
    verifiedBy:  null,
    status:      "pending",
    createdAt:   serverTimestamp(),
  });
}

// Get all marketplace receipts
export async function getMarketplaceReceipts(filters = {}) {
  const ref = collection(db, "marketplace");
  const constraints = [orderBy("createdAt", "desc")];
  if (filters.type) constraints.push(where("type", "==", filters.type));
  if (filters.verified !== undefined) constraints.push(where("verified", "==", filters.verified));

  const snap = await getDocs(query(ref, ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Get receipts uploaded by a specific user
export async function getUserReceipts(userId) {
  const ref  = collection(db, "marketplace");
  const snap = await getDocs(query(ref, where("uploadedBy", "==", userId), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Verify a receipt (mark as verified)
export async function verifyReceipt(receiptId, verifiedBy) {
  const ref = doc(db, "marketplace", receiptId);
  return await updateDoc(ref, {
    verified:   true,
    verifiedBy: verifiedBy,
    verifiedAt: serverTimestamp(),
    status:     "verified",
  });
}

// Mark receipt use case
export async function markReceiptUse(receiptId, useCase) {
  const ref = doc(db, "marketplace", receiptId);
  return await updateDoc(ref, {
    [`uses.${useCase}`]: true,
    updatedAt: serverTimestamp(),
  });
}
