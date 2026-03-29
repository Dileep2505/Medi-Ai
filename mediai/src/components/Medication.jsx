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

/* ===== STYLES ===== */
const pageCenter = {
  minHeight: "50vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F2F2F2"
};

const container = {
  width: "100%",
  padding: 20,
  borderRadius: 12,
  maxWidth: 800
};

const title = {
  fontSize: 30,
  margin: "0 auto",
  background: "#26E0A8",
  padding: "20px 20px 20px 20px",
  borderRadius: 12,
  fontWeight: "600",
  color: "#000",
  width: "80%",          // 👈 fill available space
  maxWidth: "700px",      // 👈 control size

  margin: "15px auto", 
  marginBottom: "5px"
};

const conditionTitle = {
  fontSize: "30px",
  fontWeight: "500",
  marginBottom: "15px",
  color: "#ffffff"
};

const drugList = {
  paddingLeft: "20px",
  margin: 10
};

const drugItem = {
  marginBottom: "6px"
};

const card = {
  fontSize: 20,
  border: "1px solid #ddd",
  padding: "20px 20px 20px 30px",
  borderRadius: 12,

  width: "80%",          // 👈 fill available space
  maxWidth: "700px",      // 👈 control size

  margin: "15px auto",    // 👈 center it properly

  background: "#26BBE0",
  marginBottom: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const box = {
  background: "#ff2d2d",
  padding: "25px 35px",
  borderRadius: "20px",
  width: "450px",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  fontSize: "16px",
  outline: "none",
  background: "#e5e7eb"
};
