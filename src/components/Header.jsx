import React from "react";
import { useApp } from "../context/AppContext";

const Header = ({ user = {} }) => {
  const app = useApp();
  const setActiveTab = typeof app?.setActiveTab === "function"
    ? app.setActiveTab
    : () => {};

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        
        {/* 🔵 CIRCULAR LOGO */}
        <div style={styles.logoCircle}>
          <img src="/images/logo.png" alt="logo" style={styles.logo} />
        </div>

        <div>
          <h1 style={styles.title}>MediAi</h1>
          <p style={styles.subtitle}>AI-Powered Medical Report Analysis</p>
        </div>
      </div>

      {/* PROFILE CLICK */}
      <div style={styles.rightSection} onClick={() => setActiveTab("profile")}>
        <span style={styles.doctorName}>
          {user?.name || "User"}
        </span>
        <div style={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default Header;
/* ================= STYLES ================= */
const styles = {
  header: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "18px 38px",
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },

  /* 🔵 CIRCLE CONTAINER */
  logoCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "100%",
    overflow: "hidden",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  title: { margin: 0, fontSize: "30px", fontWeight: "600" },
  subtitle: { margin: 0, fontSize: "12px", opacity: 0.9 },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  },

  doctorName: { fontSize: "30px", fontWeight: "600" },

  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "1000",
    fontSize: "28px",
    color: "#fff"
  }
};
