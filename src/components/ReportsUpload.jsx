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

        <button style={modeBtn}>
          📷 Camera
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

const container = {
  maxWidth: 1000,
  margin: "auto",
  padding: 20
};

const title = {
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 15
};

const modeRow = {
  display: "flex",
  gap: 10,
  marginBottom: 10
};

const activeMode = {
  flex: 1,
  padding: 12,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 600
};

const modeBtn = {
  flex: 1,
  padding: 12,
  background: "#f3f4f6",
  border: "none",
  borderRadius: 8,
  fontWeight: 500
};


const textarea = {
  width: "100%",
  height: 200,
  marginTop: 15,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontSize: 14
};

const fileList = {
  marginTop: 10,
  color: "#374151"
};

const processBtn = {
  marginTop: 20,
  padding: "12px 25px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  float: "right"
};
