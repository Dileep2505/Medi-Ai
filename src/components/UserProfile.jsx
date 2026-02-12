import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const UserProfile = ({ user = {}, setUser, onLogout }) => {
  const { setActiveTab } = useApp();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    name: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    photo: ""
  });

  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  /* Sync user → form */
  useEffect(() => {
    setForm({
      userId: user?.userId || "",
      name: user?.name || "",
      gender: user?.gender || "",
      bloodGroup: user?.bloodGroup || "",
      phone: user?.phone || "",
      photo: user?.photo || ""
    });
  }, [user]);

  /* Close overlay */
  const closeProfile = () => {
    if (!editMode) setActiveTab("upload");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    if (!e.target.files[0]) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(e.target.files[0]);
  };

  /* SAVE PROFILE */
  const saveProfile = async (e) => {
    e.stopPropagation();

    try {
      const response = await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!data.userId) {
        alert("Backend did not return userId");
        return;
      }

      setUser(data);
      localStorage.setItem("userId", data.userId);
      setEditMode(false);
      alert("Profile Saved");

    } catch (err) {
      console.error(err);
      alert("Backend connection failed");
    }
  };

  /* CHANGE PASSWORD */
  const changePassword = async () => {
    if (!pwd.oldPassword || !pwd.newPassword) {
      setPwdMsg("Fill both fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          oldPassword: pwd.oldPassword,
          newPassword: pwd.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setPwdMsg(data.message);
        return;
      }

      setPwdMsg("Password updated");
      setPwd({ oldPassword: "", newPassword: "" });

    } catch (err) {
      setPwdMsg("Server error");
    }
  };

  return (
    <div style={overlay} onClick={closeProfile}>
      <div style={card} onClick={(e) => e.stopPropagation()}>

        <div style={topRow}>
          <div style={avatar}>
            {form.photo ? (
              <img src={form.photo} alt="" style={avatarImg} />
            ) : (
              form.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={nameText}>{form.name || "New User"}</h2>
            <p style={idText}>User ID: {form.userId || "Not assigned"}</p>
          </div>
        </div>

        <div style={infoGrid}>
          <Info label="Gender" value={form.gender} />
          <Info label="Blood Group" value={form.bloodGroup} />
          <Info label="Phone" value={form.phone} />
        </div>

        {editMode && (
          <>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" style={input}/>
            <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" style={input}/>
            <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood Group" style={input}/>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={input}/>
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ marginBottom: 10 }}/>
          </>
        )}

        {editMode ? (
          <button style={saveBtn} onClick={saveProfile}>Save</button>
        ) : (
          <button style={editBtn} onClick={() => setEditMode(true)}>Edit Profile</button>
        )}

        <button style={logoutBtn} onClick={onLogout}>Logout</button>

        {/* PASSWORD SECTION */}
        <hr style={{ margin: "16px 0" }} />
        <h3>Change Password</h3>

        <input
          type="password"
          placeholder="Old Password"
          value={pwd.oldPassword}
          onChange={e => setPwd({ ...pwd, oldPassword: e.target.value })}
          style={input}
        />

        <input
          type="password"
          placeholder="New Password"
          value={pwd.newPassword}
          onChange={e => setPwd({ ...pwd, newPassword: e.target.value })}
          style={input}
        />

        <button style={saveBtn} onClick={changePassword}>Update Password</button>

        {pwdMsg && <p style={{ color: "red", marginTop: 8 }}>{pwdMsg}</p>}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div style={infoBox}>
    <strong>{label}</strong>
    <p style={{ margin: 0 }}>{value || "-"}</p>
  </div>
);

export default UserProfile;

/* STYLES */
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", padding: 10, zIndex: 9999 };
const card = { background: "#fff", borderRadius: 14, padding: 18, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" };
const topRow = { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 };
const avatar = { width: 55, height: 55, borderRadius: "50%", overflow: "hidden", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: 20 };
const avatarImg = { width: "100%", height: "100%", objectFit: "cover" };
const nameText = { margin: 0, fontSize: 18 };
const idText = { margin: 0, color: "#666", fontSize: 13 };
const infoGrid = { display: "grid", gap: 10, marginBottom: 14 };
const infoBox = { background: "#f1f5f9", padding: 10, borderRadius: 8 };
const input = { width: "100%", padding: 9, marginBottom: 8, borderRadius: 6, border: "1px solid #ccc" };
const editBtn = { width: "100%", padding: 11, borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: "bold" };
const saveBtn = { ...editBtn, background: "#16a34a" };
const logoutBtn = { width: "100%", padding: 11, borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: "bold", marginTop: 8 };
