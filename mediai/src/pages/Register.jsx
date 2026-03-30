import React, { useState, useRef } from "react";
import "./Auth.css";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export default function Register({
  setAuthScreen,
  setUser,
  setActiveTab,
  setLoggedIn
}) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const debounceRef = useRef(null);

  /* ================= USERNAME CHECK ================= */
  const checkUsername = (value) => {
    if (!value) return;

    setUsernameStatus("checking");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/check-username/${value}`);
        const data = await res.json();

        if (data.available) {
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
      !form.username || // ✅ now required
      !form.email ||
      !form.phone ||
      !form.gender ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (usernameStatus === "taken") {
      setError("Username already taken");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: form.fullName.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\D/g, ""),
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

      const user = data.user;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.userId);
      if (data.token) localStorage.setItem("token", data.token);

      setUser(user);
      setLoggedIn(true);

      setSuccess("Account created!");

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
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
              if (value.length > 2) checkUsername(value);
            }}
          />

          {usernameStatus === "checking" && <p>Checking...</p>}
          {usernameStatus === "available" && (
            <p style={{ color: "green" }}>✔ Available</p>
          )}
          {usernameStatus === "taken" && (
            <div>
              <p style={{ color: "red" }}>Username taken</p>
              {suggestions.map((s, i) => (
                <span
                  key={i}
                  style={{ marginRight: 10, cursor: "pointer", color: "blue" }}
                  onClick={() => {
                    setForm({ ...form, username: s });
                    setUsernameStatus("available");
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
              style={eyeStyle}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"} // ✅ FIXED
              className="auth-input"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              style={eyeStyle}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>

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

const eyeStyle = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer"
};