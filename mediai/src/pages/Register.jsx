import React, { useState, useRef } from "react";
import "./Auth.css";

const API_BASE = "https://medi-ai-backend-226z.onrender.com";

/* ================= VALIDATION ================= */
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone) =>
  /^\d{10,15}$/.test(phone);

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
};

const generateUsernameFromName = (name) => {
  if (!name) return "";
  const base = name
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(" ")
    .join("_");

  return `${base}_${Math.floor(100 + Math.random() * 900)}`;
};

export default function Register({ setAuthScreen, setUser }) {

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
  const [passwordStrength, setPasswordStrength] = useState("");

  const [usernameStatus, setUsernameStatus] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  /* ================= USERNAME CHECK ================= */
  const checkUsername = (value) => {
    if (!value) return;

    setUsernameStatus("checking");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/check-username/${value}`
        );

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

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.gender ||
      !form.password ||
      !form.confirmPassword
    ) {
      return setError("All fields required");
    }

    if (!validateEmail(form.email)) return setError("Invalid email");
    if (!validatePhone(form.phone)) return setError("Invalid phone");
    if (passwordStrength === "weak") return setError("Weak password");
    if (form.password !== form.confirmPassword)
      return setError("Passwords mismatch");

    let finalUsername = form.username || generateUsernameFromName(form.fullName);

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          username: finalUsername.toLowerCase(),
          email: form.email.toLowerCase(),
          phone: form.phone.replace(/\D/g, "")
        })
      });

      const data = await res.json();

      if (!res.ok) return setError(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ SAFE CALL
      setUser?.(data.user);

      setSuccess("Account created!");

    } catch {
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

          {/* NAME + USERNAME */}
          <div className="form-grid">
            <input
              className="auth-input"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => {
                const name = e.target.value;
                const auto = generateUsernameFromName(name);

                setForm({
                  ...form,
                  fullName: name,
                  username: form.username || auto
                });

                if (!form.username) checkUsername(auto);
              }}
            />

            <input
              className="auth-input"
              placeholder="Username"
              value={form.username}
              onChange={(e) => {
                const val = e.target.value;
                setForm({ ...form, username: val });
                if (val.length > 2) checkUsername(val);
              }}
            />
          </div>

          {usernameStatus === "available" && (
            <p style={{ color: "green" }}>✔ Available</p>
          )}

          {usernameStatus === "taken" && (
            <p className="auth-error">Username taken</p>
          )}

          {/* EMAIL + PHONE */}
          <div className="form-grid">
            <input
              className="auth-input"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

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
          </div>

          {/* GENDER */}
          <select
            className="auth-input"
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {/* PASSWORD */}
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, password: val });
              setPasswordStrength(getPasswordStrength(val));
            }}
          />

          <p style={{ fontSize: 12 }}>Strength: {passwordStrength}</p>

          {/* CONFIRM */}
          <input
            className="auth-input"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          {/* REGISTER */}
          <button
            className="auth-button"
            onClick={register}
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          {/* ERROR / SUCCESS */}
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          {/* BACK TO LOGIN */}
          <div className="auth-link">
            Back to{" "}
            <button
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontWeight: "600",
                cursor: "pointer"
              }}
              onClick={() => setAuthScreen("login")}
            >
              Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}