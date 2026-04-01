import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const reset = async () => {
    setMessage("");
    setIsSuccess(false);

    if (!token) {
      setMessage("Invalid or broken reset link");
      return;
    }

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const strongPassword =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/;

    if (!strongPassword.test(password)) {
      setMessage("Use letter, number & special symbol");
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
          body: JSON.stringify({
            password,
            confirmPassword
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Reset failed");
      }

      setIsSuccess(true);
      setMessage("Password updated successfully");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error(err);
      setMessage(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Reset Password</h2>
        <p style={subtitle}>Enter your new secure password</p>

        {message && (
          <p style={isSuccess ? successMsg : msg}>
            {message}
          </p>
        )}

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={eye}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* CONFIRM PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            style={input}
          />

          <span
            onClick={() => setShowConfirm(!showConfirm)}
            style={eye}
          >
            {showConfirm ? "🙈" : "👁️"}
          </span>
        </div>

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
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(120deg, #1e3a8a, #2563eb, #93c5fd, #e2e8f0)",
  fontFamily: "Inter, sans-serif"
};

const card = {
  width: "380px",
  padding: "36px",
  borderRadius: "20px",
  background: "#ffffff",
  boxShadow:
    "0 25px 60px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.08)",
  textAlign: "center"
};

const title = {
  fontSize: "26px",
  fontWeight: "700",
  marginBottom: "10px",
  color: "#0f172a"
};

const subtitle = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "20px"
};

const input = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  background: "#f8fafc",
  outline: "none"
};

const eye = {
  position: "absolute",
  right: 12,
  top: 14,
  cursor: "pointer"
};

const btn = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "#fff",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(37,99,235,0.4)"
};

const msg = {
  marginBottom: "12px",
  fontSize: "13px",
  color: "#ef4444"
};

const successMsg = {
  ...msg,
  color: "#16a34a"
};