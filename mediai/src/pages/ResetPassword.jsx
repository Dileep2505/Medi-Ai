import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const reset = async () => {
    setMessage("");

    if (!token) {
      setMessage("Invalid or broken reset link");
      return;
    }

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ password })
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data.message || "Reset failed");
      }

      setMessage("✅ Password updated successfully");

      // redirect after delay
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("RESET ERROR:", err);
      setMessage(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h2>Reset Password</h2>

      {message && <p style={msg}>{message}</p>}

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={input}
      />

      <button
        onClick={reset}
        disabled={loading}
        style={{
          ...btn,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  maxWidth: 400,
  margin: "100px auto",
  padding: 20,
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  padding: 12,
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold"
};

const msg = {
  marginBottom: 10,
  color: "red"
};