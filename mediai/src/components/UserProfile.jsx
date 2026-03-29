import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const API = "https://medi-ai-backend-226z.onrender.com";

const UserProfile = ({ user = {}, setUser, onLogout }) => {
  const { setActiveTab } = useApp();

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    fullName: "",
    email: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    photo: ""
  });

  /* ✅ SAFE SYNC */
  useEffect(() => {
    if (!editMode) {
      setForm(prev => ({
        userId: user?.userId || prev.userId,
        fullName: user?.fullName || prev.fullName,
        email: user?.email || prev.email,
        gender: user?.gender || prev.gender,
        bloodGroup: user?.bloodGroup || prev.bloodGroup,
        phone: user?.phone || prev.phone,
        photo: user?.photo || prev.photo
      }));
    }
  }, [user, editMode]);

  const closeProfile = () => {
    if (!editMode) setActiveTab("upload");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    if (!e.target.files[0]) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setForm({ ...form, photo: reader.result });

    reader.readAsDataURL(e.target.files[0]);
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    try {
      const res = await fetch(`${API}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email || user.email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      const updatedUser = data.user || data;

      // 🔥 HARD MERGE (NEVER LOSE DATA)
      const finalUser = {
        userId: updatedUser.userId || user.userId,
        fullName: updatedUser.fullName || user.fullName || "",
        email: updatedUser.email || user.email || "",
        gender: updatedUser.gender || user.gender || "",
        bloodGroup: updatedUser.bloodGroup || user.bloodGroup || "",
        phone: updatedUser.phone || user.phone || "",
        photo: updatedUser.photo || user.photo || ""
      };

      setUser(finalUser);
      localStorage.setItem("user", JSON.stringify(finalUser));

      setEditMode(false);

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div style={overlay}>
      <div style={card}>

        {/* HEADER */}
        <div style={header}>
  <h3 style={title}>Profile</h3>
  <span style={closeBtn} onClick={closeProfile}>✕</span>
</div>

        {/* AVATAR */}
        <div style={avatarWrap}>
          <label style={avatarCircle}>
            {form.photo ? (
              <img src={form.photo} alt="" style={avatarImg} />
            ) : (
              form.fullName?.charAt(0)?.toUpperCase() || "👤"
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* NAME + ID */}
        <div style={{ textAlign: "center" }}>
          <h2 style={nameStyle}>{form.fullName || user.fullName || "User Name"}</h2>
<p style={subText}>{form.username || user.username}</p>
        </div>

        <div style={divider}></div>

        {/* INFO */}
        <div style={info}>
  <p><span style={label}>Email:</span> {form.email || "-"}</p>
  <p><span style={label}>Phone:</span> {form.phone || "-"}</p>
  <p><span style={label}>Gender:</span> {form.gender || "-"}</p>
  <p><span style={label}>Blood Group:</span> {form.bloodGroup || "-"}</p>
</div>

        {/* EDIT MODE */}
        {editMode && (
          <>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Name" style={input}/>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={input}/>
            <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" style={input}/>
            <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood Group" style={input}/>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={input}/>
          
          </>
        )}

        {/* ACTIONS */}
        {editMode ? (
          <button style={btn} onClick={saveProfile}>Save</button>
        ) : (
          <button style={btn} onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        )}

        <button style={logoutBtn} onClick={onLogout}>
          Logout
        </button>

      </div>
    </div>
  );
};

export default UserProfile;

/* ===== CLEAN MODERN PROFILE UI ===== */

const overlay = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px"
};

const card = {
  width: "100%",
  maxWidth: "380px",
  borderRadius: "28px",
  padding: "22px",
  background: "linear-gradient(135deg, #6d28d9, #9333ea)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  color: "#fff",
  position: "relative"
};

/* ===== HEADER ===== */
const header = {
  position: "relative",
  textAlign: "center",
  marginBottom: "15px"
};

const title = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#fff"
};

const closeBtn = {
  position: "absolute",
  right: "0",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "22px",
  cursor: "pointer",
  color: "#fff",
  opacity: 0.9
};

/* ===== AVATAR ===== */
const avatarWrap = {
  display: "flex",
  justifyContent: "center",
  margin: "15px 0"
};

const avatarCircle = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #22c55e, #06b6d4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "34px",
  fontWeight: "700",
  color: "#fff",
  overflow: "hidden",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
};

const avatarImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

/* ===== NAME ===== */
const nameStyle = {
  textAlign: "center",
  fontSize: "20px",
  fontWeight: "700",
  marginTop: "8px"
};

const subText = {
  textAlign: "center",
  fontSize: "13px",
  opacity: 0.85,
  marginBottom: "12px"
};

/* ===== DIVIDER ===== */
const divider = {
  height: "1px",
  width: "100%",
  margin: "15px 0 20px",
  background: "linear-gradient(to right, transparent, #c4b5fd, transparent)"
};

/* ===== INFO BOX ===== */
const info = {
  textAlign: "left",
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.15)",
  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  lineHeight: "28px",
  fontSize: "14px",
  marginBottom: "20px"
};

const label = {
  fontWeight: "600",
  color: "#e0f2fe"
};

/* ===== INPUT ===== */
const input = {
  width: "100%",
  margin: "6px 0",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  fontSize: "14px",
  outline: "none"
};

/* ===== BUTTONS ===== */
const btn = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
  color: "#fff",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  marginBottom: "12px"
};

const logoutBtn = {
  ...btn,
  background: "linear-gradient(135deg, #ef4444, #f97316)"
};