import React, { useState } from "react";
import "./Auth.css";

export default function Login({ setUser, setLoggedIn, setAuthScreen }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 🔹 LOGIN REQUEST
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // 🔹 STORE AUTH DATA
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      // 🔥 FETCH PROFILE AFTER LOGIN
      const profileRes = await fetch(`http://localhost:5000/api/user/${data.userId}`);
      const profile = await profileRes.json();

      // If profile does not exist yet → create blank structure
      const userProfile = profile?.userId
        ? profile
        : {
            userId: data.userId,
            name: "",
            gender: "",
            bloodGroup: "",
            phone: "",
            photo: ""
          };

      setUser(userProfile);
      setLoggedIn(true);

    } catch (err) {
      console.error(err);
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>MediAi</h1>
        <p>Discover the power of personalized health insights and seamless tracking.</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Log In</h2>

          {error && <p className="auth-error">{error}</p>}

          <input
            className="auth-input"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button className="auth-button" onClick={login} disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="auth-link">
            Need an account?{" "}
            <span onClick={() => setAuthScreen("register")}>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
