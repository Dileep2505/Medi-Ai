import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";
import "./App.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId="238068066056-9p2ul7ss0tg7pg6u73rorpkjgebolrt8.apps.googleusercontent.com">
        <HashRouter>
          <App />
        </HashRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);