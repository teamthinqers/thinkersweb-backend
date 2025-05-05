/**
 * This utility helps reset the application state completely
 * Useful for troubleshooting authentication and session issues
 */

import { auth } from "./firebase";

/**
 * Completely reset application state and storage
 * @param redirectPath Optional path to redirect to after reset (defaults to /)
 */
export function resetApplicationState(redirectPath: string = "/") {
  console.log("Resetting application state...");
  
  // Clear all localStorage
  localStorage.clear();
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Force sign out from Firebase
  try {
    if (auth.currentUser) {
      auth.signOut().catch(e => console.warn("Could not sign out of Firebase:", e));
    }
  } catch (e) {
    console.warn("Error during reset:", e);
  }
  
  // Force a hard reload to reset all JavaScript state
  window.location.href = redirectPath;
}

/**
 * Add a reset button to the page (for development only)
 * Attaches a fixed position button at the bottom right that can reset the app
 */
export function addResetButton() {
  // Only in development mode
  if (import.meta.env.MODE !== "development") return;
  
  // Create reset button
  const resetButton = document.createElement("button");
  resetButton.innerText = "Reset App";
  resetButton.style.position = "fixed";
  resetButton.style.bottom = "10px";
  resetButton.style.right = "10px";
  resetButton.style.zIndex = "9999";
  resetButton.style.backgroundColor = "#f43f5e";
  resetButton.style.color = "white";
  resetButton.style.padding = "8px 16px";
  resetButton.style.borderRadius = "4px";
  resetButton.style.cursor = "pointer";
  resetButton.style.border = "none";
  resetButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
  
  // Add click handler
  resetButton.addEventListener("click", () => {
    if (confirm("Reset the entire application state? This will log you out.")) {
      resetApplicationState();
    }
  });
  
  // Add to document
  document.body.appendChild(resetButton);
}