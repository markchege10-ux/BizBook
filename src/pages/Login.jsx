import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function Login() {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const [tab,     setTab]     = useState("signin"); // signin | register | reset
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // Sign in
  const [siEmail, setSiEmail] = useState("");
  const [siPass,  setSiPass]  = useState("");

  // Register
  const [regName,     setRegName]     = useState("");
  const [regBusiness, setRegBusiness] = useState("");
  const [regPhone,    setRegPhone]    = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPass,     setRegPass]     = useState("");
  const [regPass2,    setRegPass2]    = useState("");

  // Reset
  const [resetEmail, setResetEmail] = useState("");

  const clear = () => { setError(""); setSuccess(""); };

  async function handleSignIn(e) {
    e.preventDefault(); clear();
    if (!siEmail || !siPass) return setError("Please fill in all fields.");
    setLoading(true);
    try { await login(siEmail, siPass); }
    catch (err) { setError(friendly(err.code)); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); clear();
    if (!regName || !regBusiness || !regPhone || !regEmail || !regPass)
      return setError("Please fill in all fields.");
    if (regPass !== regPass2) return setError("Passwords do not match.");
    if (regPass.length < 6)  return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register({ name: regName, businessName: regBusiness, phone: regPhone, email: regEmail, password: regPass });
      setSuccess("Account created! Check your email to verify your account.");
    }
    catch (err) { setError(friendly(err.code)); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    clear(); setLoading(true);
    try { await loginWithGoogle(); }
    catch (err) { setError(friendly(err.code)); }
    finally { setLoading(false); }
  }

  async function handleReset(e) {
    e.preventDefault(); clear();
    if (!resetEmail) return setError("Enter your email address.");
    setLoading(true);
    try { await resetPassword(resetEmail); setSuccess("Reset link sent! Check your inbox."); }
    catch (err) { setError(friendly(err.code)); }
    finally { setLoading(false); }
  }

  function friendly(code) {
    const map = {
      "auth/user-not-found":       "No account found with this email.",
      "auth/wrong-password":       "Incorrect password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email":        "Please enter a valid email address.",
      "auth/weak-password":        "Password must be at least 6 characters.",
      "auth/popup-closed-by-user": "Google sign-in was cancelled.",
      "auth/too-many-requests":    "Too many attempts. Please try again later.",
      "auth/invalid-credential":   "Invalid email or password.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Biz<span>Book</span></div>
        <p className="auth-tagline">AI bookkeeping for Kenyan SMEs</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "signin"   ? "active" : ""}`} onClick={() => { setTab("signin");   clear(); }}>Sign In</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); clear(); }}>Register</button>
        </div>

        {error   && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        {/* ── SIGN IN ── */}
        {tab === "signin" && !success && (
          <form onSubmit={handleSignIn} className="auth-form">
            <div className="field-row">
              <label className="field-label">Email address</label>
              <input className="field-input" type="email" placeholder="you@example.com" value={siEmail} onChange={e => setSiEmail(e.target.value)} required />
            </div>
            <div className="field-row">
              <label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="••••••••" value={siPass} onChange={e => setSiPass(e.target.value)} required />
            </div>
            <button type="button" className="auth-forgot" onClick={() => { setTab("reset"); clear(); }}>Forgot password?</button>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
            <div className="auth-divider"><span>or</span></div>
            <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}><GoogleIcon /> Continue with Google</button>
          </form>
        )}

        {/* ── REGISTER ── */}
        {tab === "register" && !success && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="field-row">
              <label className="field-label">Full name</label>
              <input className="field-input" type="text" placeholder="James Kamau" value={regName} onChange={e => setRegName(e.target.value)} required />
            </div>
            <div className="field-row">
              <label className="field-label">Business name</label>
              <input className="field-input" type="text" placeholder="Kamau Traders" value={regBusiness} onChange={e => setRegBusiness(e.target.value)} required />
            </div>
            <div className="field-row">
              <label className="field-label">Phone number</label>
              <input className="field-input" type="tel" placeholder="+254 7XX XXX XXX" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
            </div>
            <div className="field-row">
              <label className="field-label">Email address</label>
              <input className="field-input" type="email" placeholder="you@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
            </div>
            <div className="field-row">
              <label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="Min. 6 characters" value={regPass} onChange={e => setRegPass(e.target.value)} required />
            </div>
            <div className="field-row">
              <label className="field-label">Confirm password</label>
              <input className="field-input" type="password" placeholder="Repeat password" value={regPass2} onChange={e => setRegPass2(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>{loading ? "Creating account…" : "Create Account"}</button>
            <div className="auth-divider"><span>or</span></div>
            <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}><GoogleIcon /> Continue with Google</button>
          </form>
        )}

        {/* ── RESET ── */}
        {tab === "reset" && !success && (
          <form onSubmit={handleReset} className="auth-form">
            <p className="auth-reset-info">Enter your email and we will send you a reset link.</p>
            <div className="field-row">
              <label className="field-label">Email address</label>
              <input className="field-input" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</button>
            <button type="button" className="link-btn center" style={{ marginTop: "0.75rem" }} onClick={() => { setTab("signin"); clear(); }}>← Back to Sign In</button>
          </form>
        )}

        <p className="auth-footer">By signing in you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}
