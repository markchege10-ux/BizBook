import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail, sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Always fetch from Firestore using UID — works across all devices
        const ref  = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          // Profile missing — create it from auth data (handles edge cases)
          const fallback = {
            uid:          firebaseUser.uid,
            name:         firebaseUser.displayName ?? "",
            businessName: "",
            phone:        firebaseUser.phoneNumber ?? "",
            email:        firebaseUser.email ?? "",
            plan:         "starter",
            createdAt:    serverTimestamp(),
            provider:     firebaseUser.providerData?.[0]?.providerId ?? "email",
            photoURL:     firebaseUser.photoURL ?? "",
          };
          await setDoc(ref, fallback);
          setProfile(fallback);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  const register = useCallback(async ({ name, businessName, phone, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    const userData = {
      uid: cred.user.uid, name, businessName, phone, email,
      plan: "starter", createdAt: serverTimestamp(), provider: "email",
    };
    await setDoc(doc(db, "users", cred.user.uid), userData);
    setProfile(userData);
    return cred.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Profile loaded by onAuthStateChanged — no need to load here
    return cred.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref  = doc(db, "users", cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const userData = {
        uid:          cred.user.uid,
        name:         cred.user.displayName ?? "",
        businessName: "",
        phone:        cred.user.phoneNumber ?? "",
        email:        cred.user.email ?? "",
        plan:         "starter",
        createdAt:    serverTimestamp(),
        provider:     "google",
        photoURL:     cred.user.photoURL ?? "",
      };
      await setDoc(ref, userData);
      setProfile(userData);
    }
    // If exists, onAuthStateChanged handles loading profile
    return cred.user;
  }, []);

  const resetPassword  = useCallback((email) => sendPasswordResetEmail(auth, email), []);
  const logout         = useCallback(() => {
    setProfile(null);
    return signOut(auth);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (snap.exists()) setProfile(snap.data());
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, register, login, loginWithGoogle, resetPassword, logout, refreshProfile }}>
      {user !== undefined && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
