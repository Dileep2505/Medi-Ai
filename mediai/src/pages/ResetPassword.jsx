import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = async () => {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Reset failed");
        return;
      }

      alert("Password updated successfully");
      navigate("/"); // go back to login

    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={input}
      />

      <button onClick={reset} disabled={loading} style={btn}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}

const container = {
  maxWidth: 400,
  margin: "100px auto",
  padding: 20,
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  padding: 12,
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold"
};
