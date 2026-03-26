import React, { useState, useEffect } from "react";
import Login from "./pages/login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import ReportsUpload from "./components/ReportsUpload";
import HealthIssues from "./components/HealthIssues";
import Medication from "./components/Medication";
import UserProfile from "./components/UserProfile";
import { analyzeHealthDataAI } from "./services/aiHealthAnalyzer";
import { extractTextFromImage, extractTextFromPDF } from "./utils/ocr";
import { Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

/* ================= ROOT ================= */

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </AppProvider>
  );
}

/* ================= MAIN ================= */

function MainApp() {
  const { activeTab, setActiveTab } = useApp();

  const [authScreen, setAuthScreen] = useState("login");

  const [textReport, setTextReport] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState({
    healthIssues: [],
    labResults: []
  });
  const [analyzing, setAnalyzing] = useState(false);

  const [user, setUser] = useState(null);

  /* ================= AUTO LOGIN (REAL FIX) ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setAuthScreen("login");
  };

  /* ================= AI ================= */

  const analyzeReports = async () => {
    setAnalyzing(true);

    try {
      let extractedText = "";

      for (const file of uploadedFiles) {
        if (file.type.startsWith("image/")) {
          extractedText += " " + await extractTextFromImage(file);
        } else if (file.type === "application/pdf") {
          extractedText += " " + await extractTextFromPDF(file);
        }
      }

      const combinedText = `${textReport} ${extractedText}`
        .trim()
        .slice(0, 12000);

      const result = await analyzeHealthDataAI(combinedText);

      setAiAnalysis({
        healthIssues: result.healthIssues || [],
        labResults: result.labResults || []
      });

      setActiveTab("health");
    } catch (error) {
      console.error(error);
      alert("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ================= AUTH FLOW ================= */

  if (!user) {
    if (authScreen === "login") {
      return (
        <Login
          setUser={setUser}
          setAuthScreen={setAuthScreen}
          setActiveTab={setActiveTab}
        />
      );
    }

    if (authScreen === "register") {
      return (
        <Register
          setAuthScreen={setAuthScreen}
          setUser={setUser}
          setActiveTab={setActiveTab}
        />
      );
    }

    if (authScreen === "forgot") {
      return <ForgotPassword setAuthScreen={setAuthScreen} />;
    }

    return <Login setAuthScreen={setAuthScreen} />;
  }

  /* ================= MAIN APP ================= */

  return (
    <div style={styles.watermarkBg}>
      <Header user={user} />
      <Navigation />

      {activeTab === "upload" && (
        <ReportsUpload
          textReport={textReport}
          setTextReport={setTextReport}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          analyzeReports={analyzeReports}
          analyzing={analyzing}
        />
      )}

      {activeTab === "health" && (
        <HealthIssues aiAnalysis={aiAnalysis} />
      )}

      {activeTab === "medication" && (
        <Medication meds={aiAnalysis.healthIssues} />
      )}

      {activeTab === "profile" && (
        <UserProfile
          user={user}
          setUser={setUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;

/* ================= STYLES ================= */

const styles = {
  watermarkBg: {
    minHeight: "100vh",
    width: "100%",
    padding: "10px",
    background: "#f1f5f9"
  }
};