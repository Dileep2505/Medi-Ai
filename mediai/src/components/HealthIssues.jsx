import React from "react";
import { useApp } from "../context/AppContext";

const HealthIssues = ({ aiAnalysis = {} }) => {
  const { setActiveTab } = useApp();

  // 🔍 DEBUG (remove later if needed)
  console.log("HealthIssues DATA:", aiAnalysis);

  // ✅ HANDLE MULTIPLE API FORMATS
  const issues =
    aiAnalysis?.healthIssues ||
    aiAnalysis?.issues ||
    [];

  const labs =
    aiAnalysis?.labResults ||
    aiAnalysis?.labs ||
    [];

  return (
    <div style={container}>

      {/* ❌ NO DATA STATE */}
      {issues.length === 0 && labs.length === 0 && (
        <p style={emptyState}>
          No health issues found or analysis not completed.
        </p>
      )}

      {/* ================= CONDITIONS ================= */}
      {issues.length > 0 && (
        <>
          <h2 style={mainTitle}>Extracted Clinical Findings</h2>

          <h3 style={subTitle}>
            Health Conditions Found ({issues.length})
          </h3>

          {issues.map((issue, idx) => (
            <div key={idx} style={conditionCard}>

              <div style={headerRow}>
                <div>
                  <h2 style={{ margin: 0 }}>
                    {issue.title || issue.name || "Unknown Condition"}
                  </h2>
                  <p style={{ color: "#666" }}>
                    {issue.medicalTerm || issue.term || ""}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={severityBadge(issue.severity)}>
                    {issue.severity || "UNKNOWN"}
                  </span>
                  <p style={{ fontSize: 13 }}>
                    {issue.confidence || 0}% confidence
                  </p>
                </div>
              </div>

              <hr />

              <Section label="What is this?" text={issue.whatIsThis} />
              <Section label="What it means" text={issue.whatItMeans} />
              <Section label="Why it matters" text={issue.whyItMatters} />

              {issue.commonSymptoms?.length > 0 && (
                <>
                  <p style={bulletTitle}>Common symptoms</p>
                  <ul>
                    {issue.commonSymptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </>
              )}

              {issue.goodNews && (
                <div style={goodNewsBox}>
                  ✅ <strong>Good news:</strong> {issue.goodNews}
                </div>
              )}

            </div>
          ))}
        </>
      )}

      {/* ================= LAB RESULTS ================= */}
      {labs.length > 0 && (
        <>
          <h3 style={{ marginTop: 40 }}>
            Laboratory Results ({labs.length})
          </h3>

          {labs.map((lab, i) => (
            <div key={i} style={labCard}>
              <strong>{lab.name || "Test"}</strong>
              <h2 style={{ margin: "6px 0" }}>
                {lab.value || "N/A"}
              </h2>
              <p style={{ color: "#666" }}>
                Normal: {lab.normalRange || "-"}
              </p>

              <div style={labAlert}>
                {lab.status || "Unknown"} — medical attention recommended
              </div>

              {lab.loinc && (
                <p style={{ fontSize: 12, color: "#777" }}>
                  LOINC: {lab.loinc}
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {/* ✅ BUTTON ONLY IF DATA EXISTS */}
      {issues.length > 0 && (
        <div style={{ textAlign: "center" }}>
          <button
            style={medButton}
            onClick={() => setActiveTab("medication")}
          >
            View Medication Suggestions →
          </button>
        </div>
      )}
    </div>
  );
};

const Section = ({ label, text }) => {
  if (!text) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <strong>{label}</strong>
      <p style={{ margin: "4px 0 0", color: "#334155" }}>{text}</p>
    </div>
  );
};

export default HealthIssues;

/* ================= MODERN MEDICAL UI ================= */

const container = {
  maxWidth: "900px",
  width: "100%",
  margin: "0 auto",
  padding: "25px",
  borderRadius: "20px",

  /* 👇 HEALTH-APP STYLE BACKGROUND */
  background: "linear-gradient(135deg, #f0f9ff, #ecfeff)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.08)"
};

/* EMPTY STATE */
const emptyState = {
  textAlign: "center",
  marginTop: "40px",
  color: "#64748b",
  fontSize: "16px"
};

/* MAIN TITLE */
const mainTitle = {
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "12px",
  padding: "14px 18px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
  color: "#fff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
};

/* SUB TITLE */
const subTitle = {
  marginTop: "20px",
  padding: "12px 16px",
  borderRadius: "10px",
  background: "#e0f2fe",
  color: "#0369a1",
  fontWeight: "600"
};

/* CONDITION CARD */
const conditionCard = {
  borderRadius: "16px",
  background: "#ffffff",
  padding: "20px",
  marginTop: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",

  /* 👇 LEFT COLOR BAR (IMPORTANT VISUAL) */
  borderLeft: "6px solid #22c55e",

  transition: "0.2s"
};

/* LAB CARD */
const labCard = {
  borderRadius: "14px",
  background: "#ffffff",
  padding: "18px",
  marginTop: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  borderLeft: "6px solid #f97316"
};

/* HEADER ROW */
const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  flexWrap: "wrap"
};

/* BADGE */
const severityBadge = (sev) => ({
  background:
    sev === "SEVERE"
      ? "#ef4444"
      : sev === "MODERATE"
      ? "#f59e0b"
      : "#22c55e",
  color: "white",
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
});

/* TEXT */
const bulletTitle = {
  fontWeight: "600",
  marginTop: "14px",
  color: "#1e293b"
};

/* GOOD NEWS BOX */
const goodNewsBox = {
  background: "#ecfdf5",
  padding: "12px",
  borderRadius: "10px",
  marginTop: "14px",
  borderLeft: "4px solid #22c55e",
  color: "#065f46",
  fontWeight: "500"
};

/* LAB ALERT */
const labAlert = {
  marginTop: "10px",
  color: "#dc2626",
  fontWeight: "600"
};

/* BUTTON */
const medButton = {
  marginTop: "30px",
  width: "100%",
  maxWidth: "420px",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",

  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",

  padding: "14px",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "600",

  border: "none",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",

  transition: "0.2s"
};