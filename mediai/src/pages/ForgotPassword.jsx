import { useState } from "react";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function ForgotPassword({ setAuthScreen }) {
  const [method, setMethod] = useState("");
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= EMAIL RESET ================= */
  const sendEmailReset = async () => {
    setMessage("");

    if (!email || !email.includes("@")) {
      return setMessage("Enter valid email");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Reset link sent");

    } catch (err) {
      setMessage(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!/^\d{10,15}$/.test(phone)) {
      return setMessage("Invalid phone number");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("OTP sent");
      setStep(2);

    } catch (err) {
      setMessage(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (!otp) return setMessage("Enter OTP");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setUserId(data.userId);
      setMessage("OTP verified");
      setStep(3);

    } catch (err) {
      setMessage(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async () => {
    if (password.length < 6) {
      return setMessage("Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("Password reset successful");

      setTimeout(() => {
        setAuthScreen("login");
      }, 1500);

    } catch (err) {
      setMessage(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password</h2>

        {message && <p style={styles.message}>{message}</p>}

        {!method && (
          <>
            <button style={styles.button} onClick={() => setMethod("email")}>
              Reset via Email
            </button>
            <button style={styles.button} onClick={() => setMethod("phone")}>
              Reset via Phone
            </button>
          </>
        )}

        {method === "email" && (
          <>
            <input
              style={styles.input}
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendEmailReset} style={styles.button}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}

        {method === "phone" && (
          <>
            {step === 1 && (
              <>
                <input
                  style={styles.input}
                  placeholder="Enter phone"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                />
                <button onClick={sendOtp} style={styles.button}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <input
                  style={styles.input}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />
                <button onClick={verifyOtp} style={styles.button}>
                  Verify OTP
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <input
                  type="password"
                  style={styles.input}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={resetPassword} style={styles.button}>
                  Reset Password
                </button>
              </>
            )}
          </>
        )}

        <p style={styles.back} onClick={() => setAuthScreen("login")}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
}