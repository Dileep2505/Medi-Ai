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
          <h2 style={sectionTitle}>Extracted Clinical Findings</h2>

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

export default HealthIssues;

/* ================= STYLES ================= */

const container = {
  maxWidth: 800,
  width: "100%",
  margin: "0 auto"
};

const emptyState = {
  textAlign: "center",
  marginTop: 40,
  color: "#555",
  fontSize: 16
};

const sectionTitle = {
  fontSize: 22,
  marginBottom: 10,
  background: "#ecfdf5",
  padding: "10px 16px",
  borderRadius: 6,
  color: "#000"
};

const subTitle = {
  marginTop: 20,
  background: "#ecfdf5",
  padding: "10px 16px",
  borderRadius: 6,
  color: "#000"
};

const conditionCard = {
  border: "1px solid #facc15",
  background: "#fffbeb",
  padding: 18,
  borderRadius: 8,
  marginTop: 16
};

const labCard = {
  border: "1px solid #fb923c",
  background: "#fff7ed",
  padding: 16,
  borderRadius: 8,
  marginTop: 14
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between"
};

const severityBadge = (sev) => ({
  background:
    sev === "SEVERE"
      ? "#dc2626"
      : sev === "MODERATE"
      ? "#f59e0b"
      : "#22c55e",
  color: "white",
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 12
});

const bulletTitle = {
  fontWeight: "bold",
  marginTop: 12
};

const goodNewsBox = {
  background: "#ecfdf5",
  padding: 12,
  borderRadius: 6,
  marginTop: 12
};

const labAlert = {
  marginTop: 10,
  color: "#dc2626",
  fontWeight: "bold"
};

const medButton = {
  marginTop: 30,
  background: "#2563eb",
  color: "white",
  padding: "10px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};

const Section = ({ label, text }) => (
  text ? (
    <p>
      <strong>{label}</strong><br />
      {text}
    </p>
  ) : null
);