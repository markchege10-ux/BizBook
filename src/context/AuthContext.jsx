import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load Firestore profile
        const ref  = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Register with email + password ──
  async function register({ name, businessName, phone, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);

    // Save extra profile to Firestore
    const userData = {
      uid:          cred.user.uid,
      name,
      businessName,
      phone,
      email,
      plan:         "starter",
      createdAt:    serverTimestamp(),
      provider:     "email",
    };
    await setDoc(doc(db, "users", cred.user.uid), userData);
    setProfile(userData);
    return cred.user;
  }

  // ── Sign in with email + password ──
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // ── Sign in with Google ──
  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref  = doc(db, "users", cred.user.uid);
    const snap = await getDoc(ref);

    // First time Google sign-in — create profile
    if (!snap.exists()) {
      const userData = {
        uid:          cred.user.uid,
        name:         cred.user.displayName,
        businessName: "",
        phone:        cred.user.phoneNumber ?? "",
        email:        cred.user.email,
        plan:         "starter",
        createdAt:    serverTimestamp(),
        provider:     "google",
        photoURL:     cred.user.photoURL,
      };
      await setDoc(ref, userData);
      setProfile(userData);
    } else {
      setProfile(snap.data());
    }
    return cred.user;
  }

  // ── Password reset ──
  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  // ── Sign out ──
  async function logout() {
    await signOut(auth);
  }

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
