import { createContext, useContext, useEffect, useState, useCallback, memo } from "react";
import {
  onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, updateProfile,
  sendPasswordResetEmail, sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load profile once — don't re-listen
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  const register = useCallback(async ({ name, businessName, phone, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    const userData = { uid: cred.user.uid, name, businessName, phone, email, plan: "starter", createdAt: serverTimestamp(), provider: "email" };
    await setDoc(doc(db, "users", cred.user.uid), userData);
    setProfile(userData);
    return cred.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref  = doc(db, "users", cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const userData = { uid: cred.user.uid, name: cred.user.displayName, businessName: "", phone: cred.user.phoneNumber ?? "", email: cred.user.email, plan: "starter", createdAt: serverTimestamp(), provider: "google", photoURL: cred.user.photoURL };
      await setDoc(ref, userData);
      setProfile(userData);
    } else {
      setProfile(snap.data());
    }
    return cred.user;
  }, []);

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email), []);
  const logout        = useCallback(() => signOut(auth), []);

  const updateProfile_ = useCallback((data) => {
    setProfile(prev => ({ ...prev, ...data }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, register, login, loginWithGoogle, resetPassword, logout, updateProfile: updateProfile_ }}>
      {user !== undefined && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
