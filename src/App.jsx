import React, { useState, useEffect } from "react";
import Login from "./pages/login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import ReportsUpload from "./components/ReportsUpload";
import HealthIssues from "./components/HealthIssues";
import Medication from "./components/Medication";
import UserProfile from "./components/UserProfile";
import { analyzeHealthDataAI } from "./services/aiHealthAnalyzer";
import { extractTextFromImage, extractTextFromPDF } from "./utils/ocr";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

/* ================= MAIN APP ================= */

function MainApp() {
  const { activeTab, setActiveTab } = useApp(); // ✅ GLOBAL TAB STATE

  const [loggedIn, setLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState("login");

  const [textReport, setTextReport] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState({ healthIssues: [], labResults: [] });
  const [analyzing, setAnalyzing] = useState(false);

  const [user, setUser] = useState({
    userId: "",
    name: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    photo: ""
  });

  useEffect(() => {
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("userId");

  if (token && id) {
    setLoggedIn(true);

    fetch(`http://localhost:5000/api/user/${id}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }
}, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setAuthScreen("login");
  };

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

      const combinedText = `${textReport} ${extractedText}`.trim().slice(0, 12000);
      const result = await analyzeHealthDataAI(combinedText);

      setAiAnalysis({
        healthIssues: result.healthIssues || [],
        labResults: result.labResults || []
      });

      setActiveTab("health"); // ✅ switch via context
    } catch (error) {
      console.error(error);
      alert("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  /* 🔐 LOGIN / REGISTER */
  if (!loggedIn) {
    return authScreen === "login" ? (
      <Login setUser={setUser} setLoggedIn={setLoggedIn} setAuthScreen={setAuthScreen} />
    ) : (
      <Register setAuthScreen={setAuthScreen} />
    );
  }

  /* 🏥 MAIN UI */
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
        <UserProfile user={user} setUser={setUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

const styles = {
  watermarkBg: {
    minHeight: "100vh",
    width: "100%",
    padding: "10px",
    background: "#f1f5f9"
  }
};
