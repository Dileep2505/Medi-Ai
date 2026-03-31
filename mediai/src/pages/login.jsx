import React, { useState } from "react";
import "./Auth.css";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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

  /* ================= LOGIN ================= */
  const login = async () => {
    setError("");

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
          identifier: form.identifier,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      const user = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.userId);

      setUser(user);
      setLoggedIn(true);

      if (setActiveTab) setActiveTab("profile");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async (res) => {
    try {
      const decoded = jwtDecode(res.credential);
      console.log("GOOGLE USER:", decoded);

      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          credential: res.credential
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.userId);

      setUser(data.user);
      setLoggedIn(true);

      if (setActiveTab) setActiveTab("profile");

    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError("Google login failed");
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

          {/* GOOGLE LOGIN */}
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google login failed")}
            />
          </div>

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