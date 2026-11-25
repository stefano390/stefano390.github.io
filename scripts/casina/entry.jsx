import React, { useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "casina-dashboard";
import { dashboardData } from "./store";

function Demo() {
  const [, refresh] = useReducer(n => n + 1, 0);
  useEffect(() => {
    window.addEventListener("casina-update", refresh);
    return () => window.removeEventListener("casina-update", refresh);
  }, []);
  return <Dashboard data={dashboardData()} userName="Demo" />;
}

window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });
createRoot(document.getElementById("app")).render(<Demo />);
