import { useState } from "react";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function ForgotPassword({ setAuthScreen }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    setMessage("");

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      console.log("📤 Sending request to backend...");

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      console.log("📨 Response:", data);

      // ✅ HANDLE ERROR PROPERLY
      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      // ✅ SUCCESS
      setMessage(data.message || "Reset link sent successfully");

    } catch (err) {
      console.error("❌ Fetch error:", err);
      setMessage("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>

        <p style={styles.subtitle}>
          Enter your email to receive a password reset link.
        </p>

        {message && (
          <p style={styles.message}>{message}</p>
        )}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={sendReset}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p
          style={styles.back}
          onClick={() => setAuthScreen("login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #6a11cb, #2575fc)"
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center"
  },

  title: {
    marginBottom: "10px"
  },

  subtitle: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px"
  },

  message: {
    marginBottom: "15px",
    color: "#333"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer"
  },

  back: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#6c63ff",
    cursor: "pointer"
  }
};