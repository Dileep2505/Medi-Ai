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
          <h3>Profile</h3>
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
          <h2>{form.fullName || user.fullName || "User Name"}</h2>
          <p style={{ color: "#666" }}>{form.userId || user.userId}</p>
        </div>

        <hr />

        {/* INFO */}
        <div style={info}>
          <p><b>Email:</b> {form.email || user.email || "-"}</p>
          <p><b>Phone:</b> {form.phone || user.phone || "-"}</p>
          <p><b>Gender:</b> {form.gender || user.gender || "-"}</p>
          <p><b>Blood Group:</b> {form.bloodGroup || user.bloodGroup || "-"}</p>
        </div>

        {/* EDIT MODE */}
        {editMode && (
          <>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Name" style={input}/>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={input}/>
            <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" style={input}/>
            <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood Group" style={input}/>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={input}/>
            <input type="file" onChange={handlePhoto}/>
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

/* STYLES (unchanged) */

const overlay = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20
};

const card = {
  width: 320,
  background: "#fff",
  borderRadius: 30,
  padding: 20
};

const header = {
  display: "flex",
  justifyContent: "space-between"
};

const closeBtn = {
  cursor: "pointer",
  fontSize: 20
};

const avatarWrap = {
  display: "flex",
  justifyContent: "center",
  margin: 20
};

const avatarCircle = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  border: "2px solid black",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  cursor: "pointer"
};

const avatarImg = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover"
};

const info = {
  lineHeight: "28px"
};

const input = {
  width: "100%",
  margin: "5px 0",
  padding: 8
};

const btn = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  cursor: "pointer"
};

const logoutBtn = {
  ...btn,
  background: "red",
  color: "#fff"
};