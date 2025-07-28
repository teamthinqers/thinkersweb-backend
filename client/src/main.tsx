import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Network polyfill
// @ts-ignore
window.Network = window.Network || { 
  isOnline: () => navigator.onLine,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Create root and render
createRoot(document.getElementById("root")!).render(<App />);