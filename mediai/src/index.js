import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  console.error("Root element not found!");
  document.body.innerHTML = "<div style='color: red; padding: 20px;'>Error: Root element not found</div>";
  throw new Error("Root element not found");
}

try {
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("React render error:", error);
  container.innerHTML = `<div style='color: red; padding: 20px; font-family: monospace;'><h2>App Error</h2><pre>${error.message}</pre></div>`;
}