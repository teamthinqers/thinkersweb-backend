import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Store authentication state before hot reload
if (import.meta.hot) {
  // Save authentication state before hot updates
  import.meta.hot.dispose(() => {
    // Get current user from React Query cache
    const currentUser = queryClient.getQueryData(["/api/user"]);
    
    // Store it in sessionStorage which persists during HMR but is cleared on full refresh
    if (currentUser) {
      console.log("HMR: Storing auth state before hot update");
      sessionStorage.setItem('hmr_auth_state', JSON.stringify(currentUser));
    }
  });
  
  // Restore authentication state after hot updates
  import.meta.hot.accept(() => {
    console.log("HMR: Hot update accepted, checking for stored auth state");
    
    // Restore user after the update if available
    const storedUser = sessionStorage.getItem('hmr_auth_state');
    if (storedUser) {
      try {
        console.log("HMR: Restoring auth state after hot update");
        const userData = JSON.parse(storedUser);
        
        // Put it back in React Query cache
        window.setTimeout(() => {
          queryClient.setQueryData(["/api/user"], userData);
          console.log("HMR: Auth state restored successfully");
        }, 0);
      } catch (error) {
        console.error("HMR: Failed to restore auth state", error);
      }
    }
  });
}

// Detect Vite server disconnection to prevent unwanted logout
window.addEventListener('error', (event) => {
  if (event.message && 
      (event.message.includes('vite') || 
       event.message.includes('socket') || 
       event.message.includes('connection') || 
       event.message.includes('failed to fetch'))) {
    console.log("Connection error detected, preventing page refresh");
    event.preventDefault();
    return true;
  }
});

// Create the application root element
createRoot(document.getElementById("root")!).render(<App />);
