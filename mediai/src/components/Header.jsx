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

const styles = {
  header: {
    width: "100%",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    background: "linear-gradient(135deg, #0f172a, #1e3a8a, #2563eb)",
    color: "#fff",

    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    backdropFilter: "blur(8px)"
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },

  logoCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    overflow: "hidden",

    background: "rgba(255,255,255,0.1)",
    border: "2px solid rgba(255,255,255,0.3)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },

  subtitle: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.8
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "12px",
    transition: "all 0.3s ease"
  },

  doctorName: {
    fontSize: "16px",
    fontWeight: "600"
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",

    background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontWeight: "bold",
    fontSize: "16px",
    color: "#fff",

    boxShadow: "0 4px 12px rgba(59,130,246,0.5)"
  },

  avatarImage: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(255,255,255,0.4)"
  }
};