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

/* ========== STYLE =============*/

const container = {
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "20px",
  width: "100%"
};

const title = {
  fontSize: 30,
  fontWeight: 600,
  marginBottom: 15
};

const modeRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "10px",
  flexWrap: "wrap" // 👈 allows stacking on small screens
};

const activeMode = {
  flex: "1 1 45%", // 👈 responsive width
  minWidth: "140px",
  fontSize: "18px",
  padding: "12px",
  background: "#C41B5F",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: 600
};

const modeBtn = {
  flex: "1 1 45%",
  minWidth: "140px",
  fontSize: "16px",
  padding: "12px",
  background: "#C41B5F",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: 500
};

const textarea = {
  width: "100%",
  minHeight: "180px",
  marginTop: "15px",
  padding: "12px",
  borderRadius: "8px",
  border: "3px solid #e5e7eb",
  fontSize: "16px",
  resize: "vertical"
};

const fileList = {
  marginTop: 10,
  color: "#374151"
};

const processBtn = {
  marginTop: "30px",
  width: "100%", // 👈 THIS is the correct way
  maxWidth: "400px",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
  padding: "14px",
  background: "#5BDE10",
  border: "3px solid #4C6A78",
  color: "white",
  borderRadius: "15px",
  fontSize: "20px"
};