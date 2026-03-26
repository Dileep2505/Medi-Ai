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
              <h3>{conditionName}</h3>
              <ul>
                {drugs && drugs.length > 0 ? (
                  drugs.map((d, idx) => (
                    <li key={idx}>
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
  minHeight: "20vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 50
};

const container = {
  width: "100%",
  padding: 20,
  borderRadius: 12,
  maxWidth: 800
};

const title = {
  textAlign: "center",
  background: "#ffffff",
  padding: 10,
  borderRadius: 12,
  marginBottom: 20,
  color: "#111"
};

const card = {
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 10,
  marginTop: 12,
  background: "#ffffff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const box = {
  padding: 20,
  background: "#ffffff",
  borderRadius: 8
};

const input = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
  marginRight: 10
};
