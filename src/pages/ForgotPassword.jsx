import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const sendReset = async () => {
    await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    alert("If account exists, reset link sent");
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Forgot Password</h2>
      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <button onClick={sendReset}>Send Reset Link</button>
    </div>
  );
}
