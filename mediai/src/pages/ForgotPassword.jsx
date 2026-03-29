import { useState } from "react";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function ForgotPassword({ setAuthScreen }) {
  const [method, setMethod] = useState(""); // email | phone
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

  // ✅ STRONG VALIDATION
  if (!email || !email.includes("@")) {
    setMessage("Enter valid email");
    return;
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

    // ✅ SAFE PARSE
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned invalid response");
    }

    // ✅ DEBUG LOG (IMPORTANT)
    console.log("FORGOT RESPONSE:", res.status, data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to send reset link");
    }

    setMessage("✅ Reset link sent to email");

  } catch (err) {
    console.error("FORGOT ERROR:", err);

    if (err.message.includes("Failed to fetch")) {
      setMessage("Server unreachable");
    } else {
      setMessage(err.message || "Something went wrong");
    }

  } finally {
    setLoading(false);
  }
};

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!phone) return setMessage("Enter phone");

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
    if (!password) return setMessage("Enter new password");

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

        {/* STEP 1 - METHOD SELECT */}
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

        {/* EMAIL FLOW */}
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

        {/* PHONE FLOW */}
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
                  onChange={(e) => setOtp(e.target.value)}
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

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    background: `
      radial-gradient(circle at 20% 30%, rgba(37,99,235,0.2), transparent),
      radial-gradient(circle at 80% 70%, rgba(14,165,233,0.2), transparent),
      linear-gradient(135deg, #020617, #0f172a)
    `,
  },

  card: {
    width: "360px",
    padding: "32px",
    borderRadius: "20px",

    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",

    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",

    color: "#fff",
    textAlign: "center"
  },

  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "8px"
  },

  subtitle: {
    fontSize: "13px",
    opacity: 0.7,
    marginBottom: "20px"
  },

  stepIndicator: {
    fontSize: "12px",
    marginBottom: "15px",
    color: "#93c5fd"
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    margin: "10px 0",

    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",

    background: "rgba(255,255,255,0.05)",
    color: "#fff",

    outline: "none",
    fontSize: "14px",
    transition: "0.3s"
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",

    borderRadius: "10px",
    border: "none",

    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",

    fontWeight: "600",
    cursor: "pointer",

    transition: "all 0.3s ease",
    boxShadow: "0 8px 20px rgba(37,99,235,0.4)"
  },

  secondaryBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",

    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",

    background: "transparent",
    color: "#fff",

    cursor: "pointer"
  },

  message: {
    marginBottom: "10px",
    fontSize: "13px",
    color: "#f87171"
  },

  success: {
    color: "#4ade80"
  },

  back: {
    marginTop: "18px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#93c5fd"
  }
};