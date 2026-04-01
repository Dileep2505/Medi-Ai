import React, { useState } from "react";
import "./Auth.css";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function Login({
  setUser,
  setAuthScreen,
  setActiveTab
}) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ================= LOGIN ================= */
  const login = async () => {
    setError("");

    if (!form.identifier || !form.password) {
      return setError("Enter email / username / phone and password");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: form.identifier,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // ✅ STORE
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.userId);

      // ✅ SAFE CALLS
      setUser?.(data.user);
      setActiveTab?.("profile");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>MediAi</h1>
        <p>
          Discover the power of personalized health insights and seamless tracking.
        </p>
        
        <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <h3 style={{ marginTop: "0", marginBottom: "15px", fontSize: "18px" }}>About MediAi</h3>
          
          <div style={{ fontSize: "14px", lineHeight: "1.8", color: "rgba(255,255,255,0.9)" }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>🏥 Intelligent Medical Analysis</strong><br/>
              MediAi leverages AI-powered technology to analyze your medical reports, health conditions, and provide personalized insights.
            </p>
            
            <p style={{ marginBottom: "12px" }}>
              <strong>📊 Smart Health Tracking</strong><br/>
              Track your health conditions, medications, and lab results in one secure place with our advanced analytics.
            </p>
            
            <p style={{ marginBottom: "12px" }}>
              <strong>💊 Medication Recommendations</strong><br/>
              Get AI-driven medication suggestions based on your health profile and medical history.
            </p>
            
            <p style={{ marginBottom: "12px" }}>
              <strong>🔐 Secure & Private</strong><br/>
              Your health data is encrypted and protected with enterprise-grade security standards.
            </p>
            
            <p style={{ marginBottom: "0" }}>
              <strong>⚡ Fast & Efficient</strong><br/>
              OCR-powered document scanning means instant analysis of your medical reports.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Log In</h2>

          {error && <p className="auth-error">{error}</p>}

          {/* IDENTIFIER */}
          <input
            className="auth-input"
            placeholder="Email / Username / Phone"
            value={form.identifier}
            onChange={(e) =>
              setForm({ ...form, identifier: e.target.value })
            }
          />

          {/* PASSWORD */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            {/* 👁️ Toggle */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer"
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* FORGOT */}
          <div
            style={{
              textAlign: "right",
              fontSize: "14px",
              marginBottom: "10px",
              cursor: "pointer",
              color: "#6c63ff"
            }}
            onClick={() => setAuthScreen("forgot")}
          >
            Forgot Password?
          </div>

          <button
            className="auth-button"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* GOOGLE BUTTON */}
          <button
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "15px",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              background: "#fff",
              cursor: "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: 0.6
            }}
            disabled
            title="Google login coming soon"
          >
            <span>🔐</span>
            <span>Sign in with Google</span>
          </button>

          {/* SIGNUP */}
          <div className="auth-link">
            Need an account?{" "}
            <span onClick={() => setAuthScreen("register")}>
              Sign up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}