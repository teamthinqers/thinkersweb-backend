/**
 * ViteConnectionGuard
 * 
 * This utility helps preserve authentication state during Vite's hot module reload
 * and server disconnection issues. It detects when Vite's WebSocket connection
 * is lost and preserves authentication, then restores it when the connection
 * is reestablished.
 */

import { queryClient } from "./queryClient";

export function initViteConnectionGuard() {
  console.log("ViteConnectionGuard: Initializing connection protection...");
  
  // Track connection state
  let connectionLost = false;
  let reconnectCheckInterval: number | null = null;
  
  // Handle Vite connection errors
  const handleError = (event: ErrorEvent) => {
    // Detect Vite connection related errors
    const isViteConnectionError = 
      event.message?.includes("vite") || 
      event.message?.includes("socket") ||
      event.message?.includes("WebSocket") ||
      event.message?.includes("Failed to fetch") ||
      event.message?.includes("connection") ||
      event.error?.toString().includes("WebSocket");
      
    if (isViteConnectionError) {
      console.log("ViteConnectionGuard: Detected Vite connection issue:", event.message);
      connectionLost = true;
      
      // Prevent the error from propagating
      event.preventDefault();
      
      // Save authentication state
      const user = queryClient.getQueryData(["/api/user"]);
      if (user) {
        console.log("ViteConnectionGuard: Saving auth state before potential reload");
        sessionStorage.setItem('vite_connection_user', JSON.stringify(user));
      }
      
      // Start checking for reconnection if not already
      if (!reconnectCheckInterval) {
        console.log("ViteConnectionGuard: Starting reconnection check interval");
        reconnectCheckInterval = window.setInterval(() => {
          // Simple health check to see if connection is restored
          fetch('/api/health', { 
            method: 'GET', 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' } 
          })
            .then(response => {
              if (response.ok && connectionLost) {
                console.log("ViteConnectionGuard: Server connection restored");
                connectionLost = false;
                
                // Wait a bit for everything to initialize properly
                setTimeout(() => {
                  restoreAuthState();
                }, 1000);
                
                // Clear interval if we're reconnected
                if (reconnectCheckInterval) {
                  clearInterval(reconnectCheckInterval);
                  reconnectCheckInterval = null;
                }
              }
            })
            .catch(() => {
              // Still disconnected, will retry
            });
        }, 2000); // Check every 2 seconds
      }
    }
  };
  
  // Listen for message events that might indicate Vite connection status
  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      const data = event.data;
      
      // Detect Vite WebSocket reconnection
      if (data.includes('vite:') && data.includes('connect')) {
        console.log("ViteConnectionGuard: Vite websocket connected");
        connectionLost = false;
        
        // Wait a short delay for the application to stabilize
        setTimeout(() => {
          restoreAuthState();
        }, 500);
        
        // Clear interval if we have one
        if (reconnectCheckInterval) {
          clearInterval(reconnectCheckInterval);
          reconnectCheckInterval = null;
        }
      }
    }
  };
  
  // Function to restore authentication state
  const restoreAuthState = () => {
    const savedUser = sessionStorage.getItem('vite_connection_user');
    if (savedUser) {
      try {
        console.log("ViteConnectionGuard: Restoring authentication state");
        const userData = JSON.parse(savedUser);
        queryClient.setQueryData(["/api/user"], userData);
        console.log("ViteConnectionGuard: Authentication state restored successfully");
      } catch (error) {
        console.error("ViteConnectionGuard: Failed to restore authentication", error);
      }
    }
  };
  
  // Check if we have stored data from a previous connection loss
  const checkForStoredAuth = () => {
    const savedUser = sessionStorage.getItem('vite_connection_user');
    if (savedUser) {
      console.log("ViteConnectionGuard: Found stored auth state, attempting to restore");
      setTimeout(() => {
        restoreAuthState();
      }, 500);
    }
  };
  
  // Register event listeners
  window.addEventListener('error', handleError);
  window.addEventListener('message', handleMessage);
  
  // Check on initialization
  checkForStoredAuth();
  
  // Setup unload handler to preserve state on page refresh/reload
  window.addEventListener('beforeunload', () => {
    const user = queryClient.getQueryData(["/api/user"]);
    if (user) {
      console.log("ViteConnectionGuard: Saving auth state before page unload");
      sessionStorage.setItem('vite_connection_user', JSON.stringify(user));
    }
  });
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('message', handleMessage);
    if (reconnectCheckInterval) {
      clearInterval(reconnectCheckInterval);
    }
  };
}