import React, { useState } from "react";
import "./Auth.css";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function Login({ setUser, setLoggedIn, setAuthScreen }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁

  const login = async () => {
  setError("");

  if (!form.email || !form.password) {
    setError("Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
      signal: controller.signal
    });

    clearTimeout(timeout);

    // 🔴 SAFE JSON PARSE
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);

    // 🔴 FETCH PROFILE (SAFE)
    const profileRes = await fetch(`${API_BASE}/api/user/${data.userId}`);

    let profile = {};
    try {
      profile = await profileRes.json();
    } catch {
      console.warn("Profile response invalid");
    }

    const userProfile = profile?.userId
      ? profile
      : {
          userId: data.userId,
          name: "",
          gender: "",
          bloodGroup: "",
          phone: "",
          photo: "",
        };

    setUser(userProfile);
    setLoggedIn(true);

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    // 🔴 BETTER ERROR HANDLING
    if (err.name === "AbortError") {
      setError("Server timeout");
    } else if (err.message.includes("Failed to fetch")) {
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
          Discover the power of personalized health insights and seamless
          tracking.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Log In</h2>

          {error && <p className="auth-error">{error}</p>}

          {/* EMAIL */}
          <input
            className="auth-input"
            placeholder="Email address"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* PASSWORD + EYE */}
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
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              {showPassword ? "😴" : "🫣"}
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

          {/* GOOGLE SIGN IN (UI ONLY) */}
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