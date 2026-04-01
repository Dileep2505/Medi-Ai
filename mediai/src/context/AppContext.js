import { createContext, useContext, useState } from "react";

/* ================= CONTEXT ================= */

const AppContext = createContext({
  activeTab: "upload",
  setActiveTab: () => {}
});

/* ================= PROVIDER ================= */

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <AppContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </AppContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    console.warn("useApp called outside of AppProvider - returning default context");
    return { activeTab: "upload", setActiveTab: () => {} };
  }

  return context;
}