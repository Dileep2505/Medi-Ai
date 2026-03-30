import React from "react";
import { useApp } from "../context/AppContext";   // 🔥 USE CONTEXT

const Navigation = () => {
  const { activeTab, setActiveTab } = useApp();   // 🔥 GET STATE FROM CONTEXT

  return (
    <div style={styles.nav}>
      <button
        style={activeTab === "upload" ? styles.activeBtn : styles.btn}
        onClick={() => setActiveTab("upload")}
      >
        Upload Files
      </button>

      <button
        style={activeTab === "health" ? styles.activeBtn : styles.btn}
        onClick={() => setActiveTab("health")}
      >
        Health Issues
      </button>

      <button
        style={activeTab === "medication" ? styles.activeBtn : styles.btn}
        onClick={() => setActiveTab("medication")}
      >
        Medication
      </button>
    </div>
  );
};

export default Navigation;

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    minHeight: "80vh",
    background: "linear-gradient(135deg, #e0f2fe, #f0f9ff, #dbeafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"

  },

  nav: {
    display: "flex",
    gap: "20px",
    padding: "20px 30px",
    marginRight: "98px",
    marginBottom: "1%",
    marginTop: "1%",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
  },

  btn: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    border: "2px solid transparent",
    background: "rgba(255,255,255,0.8)",
    color: "#1e3a8a",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },

  activeBtn: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    border: "2px solid #2563eb",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)"
  }
};