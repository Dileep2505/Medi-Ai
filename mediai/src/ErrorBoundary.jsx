import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("APP CRASH:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px 20px",
          textAlign: "center",
          fontFamily: "system-ui",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "600px",
            textAlign: "left"
          }}>
            <h1 style={{ color: "#dc2626", marginBottom: "16px" }}>
              ⚠️ Application Error
            </h1>
            <p style={{ color: "#666", marginBottom: "16px", lineHeight: "1.6" }}>
              The application encountered an error and couldn't continue.
            </p>
            <div style={{
              backgroundColor: "#fee2e2",
              padding: "12px",
              borderRadius: "4px",
              color: "#991b1b",
              fontFamily: "monospace",
              fontSize: "12px",
              overflowX: "auto",
              marginBottom: "16px"
            }}>
              <strong>Error:</strong> {this.state.error?.toString()}
            </div>
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details style={{ marginBottom: "16px" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#666" }}>
                  Stack Trace
                </summary>
                <pre style={{
                  backgroundColor: "#f3f4f6",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  overflow: "auto",
                  marginTop: "8px"
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.href = "/"}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}