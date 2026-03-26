import React, { useState, useRef } from "react";
import "./Auth.css";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function Register({ setAuthScreen, setUser, setActiveTab }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const debounceRef = useRef(null);

  /* ================= USERNAME CHECK ================= */
  const checkUsername = (value) => {
    setUsernameStatus("checking");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/check-username/${value}`
        );

        if (!res.ok) {
          setUsernameStatus(null);
          return;
        }

        const data = await res.json();

        if (data.available === true) {
          setUsernameStatus("available");
          setSuggestions([]);
        } else {
          setUsernameStatus("taken");
          setSuggestions(data.suggestions || []);
        }

      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  };

  /* ================= REGISTER ================= */
  const register = async () => {
    setError("");
    setSuccess("");

    if (
      !form.fullName ||
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.gender ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (usernameStatus !== "available") {
      setError("Choose a valid username");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        password: form.password
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // 🔥 SAFE USER EXTRACTION
      const user = data.user || data;

      if (!user || !user.userId) {
        setError("Invalid response from server");
        return;
      }

      // 🔥 STORE USER
      localStorage.setItem("user", JSON.stringify(user));

      // 🔥 UPDATE GLOBAL STATE
      if (setUser) setUser(user);

      setSuccess("Account created!");

      // 🔥 NAVIGATION
      setTimeout(() => {
        if (setActiveTab) {
          setActiveTab("profile");
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }, 800);

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>MediAi</h1>
        <p>Create your account to start tracking your health insights.</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          {/* FULL NAME */}
          <input
            className="auth-input"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />

          {/* USERNAME */}
          <input
            className="auth-input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => {
              const value = e.target.value.trim();
              setForm({ ...form, username: value });

              if (value.length > 2) {
                checkUsername(value);
              } else {
                setUsernameStatus(null);
                setSuggestions([]);
              }
            }}
          />

          {usernameStatus === "checking" && <p>Checking...</p>}
          {usernameStatus === "available" && (
            <p style={{ color: "green" }}>✔ Available</p>
          )}
          {usernameStatus === "taken" && (
            <div>
              <p style={{ color: "red" }}>✖ Taken</p>
              {suggestions.map((s, i) => (
                <span
                  key={i}
                  style={{ marginLeft: 8, cursor: "pointer", color: "blue" }}
                  onClick={() => {
                    setForm({ ...form, username: s });
                    setUsernameStatus("available");
                    setSuggestions([]);
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* EMAIL */}
          <input
            className="auth-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* PHONE */}
          <input
            className="auth-input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, "")
              })
            }
          />

          {/* GENDER */}
          <select
            className="auth-input"
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* PASSWORD */}
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {/* CONFIRM PASSWORD */}
          <input
            type="password"
            className="auth-input"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <button
            className="auth-button"
            onClick={register}
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="auth-link">
            Already have an account?{" "}
            <span onClick={() => setAuthScreen("login")}>
              Log in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}