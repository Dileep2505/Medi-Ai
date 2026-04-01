import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./App.css";

const container = document.getElementById("root");

if (!container) {
  console.error("Root element not found!");
  document.body.innerHTML = "<div style='color: red; padding: 20px;'>Error: Root element not found</div>";
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);