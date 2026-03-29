import React, { useRef } from "react";

const ReportsUpload = ({
  textReport,
  setTextReport,
  uploadedFiles,
  setUploadedFiles,
  analyzeReports,
  analyzing
}) => {
  const fileRef = useRef();

  const handleFiles = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  return (
    <div style={container}>

      {/* HEADER */}
      <h2 style={title}>Upload Medical Report</h2>

      {/* MODE BUTTONS */}
      <div style={modeRow}>
        <button style={activeMode}>📄 Text Input</button>

        <button style={modeBtn} onClick={() => fileRef.current.click()}>
          ⬆ Upload File
        </button>
      </div>


      {/* TEXT AREA */}
      <textarea
        placeholder="Paste medical report text here or load sample..."
        value={textReport}
        onChange={(e) => setTextReport(e.target.value)}
        style={textarea}
      />

      {/* FILE INPUT (HIDDEN) */}
      <input
        type="file"
        multiple
        accept="image/*,.pdf"
        ref={fileRef}
        onChange={handleFiles}
        style={{ display: "none" }}
      />

      {/* FILE LIST */}
      {uploadedFiles.length > 0 && (
        <ul style={fileList}>
          {uploadedFiles.map((f, i) => (
            <li key={i}>{f.name}</li>
          ))}
        </ul>
      )}

      {/* PROCESS BUTTON */}
      <button
        onClick={analyzeReports}
        disabled={analyzing}
        style={processBtn}
      >
        {analyzing ? "Processing..." : "Process Report"}
      </button>

    </div>
  );
};

export default ReportsUpload;

/* ========== PREMIUM MEDICAL UPLOAD UI =============*/

const container = {
  maxWidth: "950px",
  margin: "0 auto",
  padding: "25px",
  width: "100%",

  /* 👇 HEALTH-APP BACKGROUND */
  background: "linear-gradient(135deg, #f0f9ff, #ecfeff)",
  borderRadius: "20px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.08)"
};

/* TITLE */
const title = {
  fontSize: "26px",
  fontWeight: "700",
  marginBottom: "15px",
  color: "#0f172a",
  textAlign: "center"
};

/* MODE BUTTON ROW */
const modeRow = {
  display: "flex",
  gap: "12px",
  marginBottom: "15px",
  flexWrap: "wrap"
};

/* ACTIVE BUTTON */
const activeMode = {
  flex: "1 1 45%",
  minWidth: "140px",
  fontSize: "16px",
  padding: "12px",
  borderRadius: "10px",
  border: "none",

  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
  color: "#fff",

  fontWeight: "600",
  boxShadow: "0 6px 15px rgba(0,0,0,0.2)"
};

/* NORMAL BUTTON */
const modeBtn = {
  flex: "1 1 45%",
  minWidth: "140px",
  fontSize: "15px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",

  background: "#ffffff",
  color: "#2563eb",

  fontWeight: "500",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

/* TEXT AREA */
const textarea = {
  width: "100%",
  minHeight: "200px",
  marginTop: "10px",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  resize: "vertical",

  background: "#ffffff",
  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.05)"
};

/* FILE LIST */
const fileList = {
  marginTop: "15px",
  padding: "12px",
  borderRadius: "10px",
  background: "#f8fafc",
  border: "1px dashed #cbd5e1",
  color: "#334155",
  fontSize: "14px"
};

/* PROCESS BUTTON */
const processBtn = {
  marginTop: "30px",
  width: "100%",
  maxWidth: "420px",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",

  padding: "14px",
  borderRadius: "14px",
  border: "none",

  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",

  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",

  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};