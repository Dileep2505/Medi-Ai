import React, { useState } from "react";
import "./Auth.css";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function Login({
  setUser,
  setLoggedIn,
  setAuthScreen,
  setActiveTab
}) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    setError("");

    // ✅ FIXED
    if (!form.identifier || !form.password) {
      setError("Enter email / username / phone and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.identifier,
          password: form.password
        })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ SAFE USER CHECK
      if (!data.user || !data.user.userId) {
        throw new Error("Invalid user data from server");
      }

      const user = data.user;

      // ✅ STORE
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.userId);

      // ✅ UPDATE STATE
      setUser(user);
      setLoggedIn(true);

      // ✅ REDIRECT (guaranteed)
      setTimeout(() => {
        window.location.reload();
      }, 200);

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.message.includes("Failed to fetch")) {
        setError("Server unreachable / CORS issue");
      } else {
        setError(err.message);
      }

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

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                cursor: "pointer"
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          {/* FORGOT PASSWORD */}
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

          {/* LOGIN */}
          <button
            className="auth-button"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* GOOGLE */}
          <button
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff"
            }}
            onClick={() => alert("Google login not implemented")}
          >
            🔐 Continue with Google
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