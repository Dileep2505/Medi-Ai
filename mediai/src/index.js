import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";

// Lazy load App to ensure all dependencies are initialized
const LazyApp = React.lazy(() => 
  import("./App").catch((err) => {
    console.error("Failed to load App:", err);
    return { default: () => <div style={{ color: "red", padding: "20px" }}>Failed to load application: {err.message}</div> };
  })
);

const ErrorFallback = ({ error }) => (
  <div style={{ color: "red", padding: "20px", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
    {error?.message || "Unknown error"}
  </div>
);

const container = document.getElementById("root");

if (!container) {
  document.body.innerHTML = "<div style='color: red; padding: 20px;'>Root element not found</div>";
} else {
  try {
    const root = ReactDOM.createRoot(container);
    
    root.render(
      <React.StrictMode>
        <Suspense fallback={<div style={{ padding: "20px" }}>Loading...</div>}>
          <LazyApp />
        </Suspense>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Render error:", error);
    container.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">${error.message}</div>`;
  }
}