import React, { useState } from "react";
import "./Auth.css";

export default function Register({ setAuthScreen }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const register = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.status !== 200) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully!");
      setTimeout(() => setAuthScreen("login"), 1500);

    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>MediAi</h1>
        <p>Create your account to start tracking your health insights powered by AI.</p>
      </div>

      {/* RIGHT CARD */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>

          {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}
          {success && <p style={{ color: "green", marginBottom: 10 }}>{success}</p>}

          <input
            className="auth-input"
            placeholder="Email address"
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button className="auth-button" onClick={register}>
            Register
          </button>

          <div className="auth-link">
            Already have an account?{" "}
            <span onClick={() => setAuthScreen("login")}>Log in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
