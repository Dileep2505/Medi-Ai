import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const Header = () => {
  const app = useApp();
  const setActiveTab =
    typeof app?.setActiveTab === "function" ? app.setActiveTab : () => {};

  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ✅ fallback initial
  const initial =
    user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        
        {/* LOGO */}
        <div style={styles.logoCircle}>
          <img
            src={process.env.PUBLIC_URL + "/images/logo.png"}
            alt="logo"
            style={styles.logo}
          />
        </div>

        <div>
          <h1 style={styles.title}>MediAi</h1>
          <p style={styles.subtitle}>
            AI-Powered Medical Report Analysis
          </p>
        </div>
      </div>

      {/* PROFILE */}
      <div
        style={styles.rightSection}
        onClick={() => setActiveTab("profile")}
      >
        <span style={styles.doctorName}>
          {user?.fullName || "User"}
        </span>

        {/* ✅ PROFILE IMAGE OR INITIAL */}
        {user?.photo ? (
          <img
            src={user.photo}
            alt="profile"
            style={styles.avatarImage}
          />
        ) : (
          <div style={styles.avatar}>
            {initial}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

/* ================= STYLES ================= */

const styles = {
  header: {
    background: "#801BC4",
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

  logoCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#E00B0B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid White",
    boxShadow: "1 4px 6px rgba(0,2,0,0.2)"
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  title: {
    margin: 0,
    fontSize: "40px",
    fontWeight: "700"
  },

  subtitle: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.9
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    cursor: "pointer"
  },

  doctorName: {
    fontSize: "35px",
    fontWeight: "600"
  },

  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "24px",
    color: "#fff"
  },

  avatarImage: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid black"
  }
};