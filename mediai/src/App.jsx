import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import ReportsUpload from "./components/ReportsUpload";
import HealthIssues from "./components/HealthIssues";
import Medication from "./components/Medication";
import UserProfile from "./components/UserProfile";
import ErrorBoundary from "./ErrorBoundary";
import { analyzeHealthDataAI } from "./services/aiHealthAnalyzer";
import { extractTextFromImage, extractTextFromPDF } from "./utils/ocr";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

/* ================= ROOT ================= */

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/reset/:token" element={<ResetPassword />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

/* ================= MAIN ================= */

function MainApp() {

  // ✅ SAFE CONTEXT
  const appContext = useApp() || {};
  const activeTab = appContext.activeTab || "upload";
  const setActiveTab = appContext.setActiveTab || (() => {});

  const [authScreen, setAuthScreen] = useState("login");
  const [user, setUser] = useState(null);

  const [textReport, setTextReport] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState({
    healthIssues: [],
    labResults: []
  });
  const [analyzing, setAnalyzing] = useState(false);

  /* ================= AUTO LOGIN ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
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

      const result = await analyzeHealthDataAI(combinedText) || {};

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
