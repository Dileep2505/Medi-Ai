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
        Upload
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
  nav: {
    display: "flex",
    gap: "16px",
    padding: "20px 30px",
    background: "#f1f5f9",
    justifyContent: "center"
  },

  btn: {
    padding: "14px 28px",
    fontSize: "18px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "2px solid #2563eb",
    background: "white",
    color: "#2563eb",
    cursor: "pointer",
    transition: "0.2s"
  },

  activeBtn: {
    padding: "14px 28px",
    fontSize: "18px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "2px solid #2563eb",
    background: "#2563eb",
    color: "white",
    cursor: "pointer"
  }
};
