import { useState } from "react";

export default function Login() {
  const [method, setMethod] = useState("phone"); // phone | email
  const [value, setValue] = useState("");
  const [step, setStep] = useState("input"); // input | otp
  const [otp, setOtp] = useState("");

  const handleContinue = () => {
    if (!value) return;
    // TODO: call auth.sendOTP(method, value)
    setStep("otp");
  };

  const handleVerify = () => {
    if (otp.length < 4) return;
    // TODO: call auth.verifyOTP(otp) then navigate to dashboard
    window.location.hash = "/";
  };

  return (
    <div className="page login-page">
      <div className="login-logo">BizBook</div>
      <p className="login-tagline">AI bookkeeping for Kenyan SMEs</p>

      <div className="card" style={{ marginTop: "2rem" }}>
        {step === "input" && (
          <>
            <p className="section-title">Sign in</p>
            <div className="segment-control" style={{ marginTop: "1rem" }}>
              {["phone", "email"].map((m) => (
                <button
                  key={m}
                  className={`segment-btn ${method === m ? "active" : ""}`}
                  onClick={() => setMethod(m)}
                >
                  {m === "phone" ? "📱 Phone" : "✉️ Email"}
                </button>
              ))}
            </div>
            <div className="field-row" style={{ marginTop: "1rem" }}>
              <label className="field-label">{method === "phone" ? "Phone number" : "Email address"}</label>
              <input
                className="field-input"
                type={method === "phone" ? "tel" : "email"}
                placeholder={method === "phone" ? "+254 7XX XXX XXX" : "you@example.com"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} onClick={handleContinue}>
              Continue
            </button>

            <div className="divider-h"><span>or</span></div>

            <button className="btn-google" onClick={() => { /* TODO: Google OAuth */ }}>
              <span>G</span> Continue with Google
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="section-title">Enter OTP</p>
            <p className="label" style={{ marginTop: "0.5rem" }}>
              Code sent to {value}
            </p>
            <div className="field-row" style={{ marginTop: "1rem" }}>
              <label className="field-label">One-time code</label>
              <input
                className="field-input"
                type="number"
                placeholder="_ _ _ _"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} onClick={handleVerify}>
              Verify &amp; sign in
            </button>
            <button className="link-btn center" style={{ marginTop: "0.75rem" }} onClick={() => setStep("input")}>
              ← Back
            </button>
          </>
        )}
      </div>

      <p className="login-footer">
        By signing in you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
