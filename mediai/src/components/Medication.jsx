import React, { useState } from "react";
import { getMedications } from "./medical/medicationEngine";

const Medication = ({ meds }) => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  /* ⛔ BLOCK UNTIL INFO ENTERED */
  if (!age || !gender) {
    return (
      <div style={pageCenter}>
        <div style={box}>
          <h3>Patient Information Required</h3>
          <input
            type="number"
            placeholder="Enter Age"
            value={age}
            onChange={e => setAge(e.target.value)}
            style={input}
          />
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            style={input}
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>
    );
  }

  if (!meds || meds.length === 0) {
    return (
      <div style={pageCenter}>
        <div style={box}>
          <p>No medication suggestions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageCenter}>
      <div style={container}>
        <h2 style={title}>💊 Medication Suggestions</h2>

        {meds.map((issue, i) => {
          const conditionName = issue.title || issue.name;

          // 🔥 ENGINE DOES THE MAPPING
          const drugs = getMedications(conditionName, Number(age), gender);

          return (
            <div key={i} style={card}>
               <h3 style={conditionTitle}>{conditionName}</h3>
              <ul style={drugList}>
      {drugs && drugs.length > 0 ? (
        drugs.map((d, idx) => (
          <li key={idx} style={drugItem}>
            <b>{d.name}</b> — {d.dose} — {d.form}
          </li>
        ))
      ) : (
        <li>No medications found</li>
      )}
    </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Medication;

/* ===== CLEAN PREMIUM MEDICAL UI ===== */

const pageCenter = {
  minHeight: "50vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",

  /* 👇 MEDICAL-STYLE BACKGROUND (SOFT + TRUST) */
  background: "linear-gradient(135deg, #f8fafc, #e0f2fe)"
};

/* MAIN CONTAINER */
const container = {
  width: "100%",
  maxWidth: "900px",
  padding: "30px",
  borderRadius: "20px",

  background: "#ffffff",
  boxShadow: "0 20px 50px rgba(0,0,0,0.08)"
};

/* TITLE */
const title = {
  fontSize: "26px",
  textAlign: "center",
  fontWeight: "700",
  marginBottom: "25px",
  color: "#0f172a"
};

/* CARD */
const card = {
  borderRadius: "16px",
  padding: "20px",
  marginTop: "16px",

  background: "#f8fafc",
  border: "1px solid #e2e8f0",

  boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
};

/* CONDITION NAME */
const conditionTitle = {
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "10px",
  color: "#0369a1"
};

/* LIST */
const drugList = {
  paddingLeft: "20px",
  margin: 0,
  fontSize: "15px",
  color: "#334155",
  lineHeight: "1.7"
};

const drugItem = {
  marginBottom: "8px"
};

/* INPUT BOX */
const box = {
  width: "100%",
  maxWidth: "420px",
  padding: "25px",
  borderRadius: "18px",

  background: "#ffffff",
  boxShadow: "0 15px 40px rgba(0,0,0,0.1)",

  display: "flex",
  flexDirection: "column",
  gap: "15px"
};

/* INPUT */
const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  outline: "none",
  background: "#f9fafb"
};