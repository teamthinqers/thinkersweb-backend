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
      (event.message?.includes("vite") || 
      event.message?.includes("socket") ||
      event.message?.includes("WebSocket") ||
      event.message?.includes("Failed to fetch") ||
      event.message?.includes("connection") ||
      event.message?.includes("network") ||
      event.error?.toString().includes("WebSocket")) &&
      !event.message?.includes("api");  // Avoid intercepting regular API errors
      
    if (isViteConnectionError) {
      console.log("ViteConnectionGuard: Detected Vite connection issue:", event.message);
      connectionLost = true;
      
      // Prevent the error from propagating to avoid scaring the user
      event.preventDefault();
      
      // Only save auth state if we have it
      const user = queryClient.getQueryData(["/api/user"]);
      if (user) {
        console.log("ViteConnectionGuard: Saving auth state before potential reload");
        // Use both sessionStorage (for HMR/reload) and localStorage (for hard refresh)
        sessionStorage.setItem('vite_connection_user', JSON.stringify(user));
        localStorage.setItem('vite_connection_user_backup', JSON.stringify({
          user,
          timestamp: Date.now()
        }));
      }
      
      // Start checking for reconnection if not already
      if (!reconnectCheckInterval) {
        console.log("ViteConnectionGuard: Starting reconnection check interval");
        reconnectCheckInterval = window.setInterval(() => {
          // Try two approaches: 
          // 1. Check health endpoint (might not work if whole server restarted)
          // 2. Check for vite's own HMR websocket status
          
          try {
            // Simple health check to see if connection is restored
            fetch('/api/health', { 
              method: 'GET', 
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' } 
            })
              .then(response => {
                if (response.ok && connectionLost) {
                  console.log("ViteConnectionGuard: Server connection restored via health check");
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
                // Still disconnected, will continue checking
              });
              
            // Also check if the Vite WebSocket is connected
            // This is a bit of a hack, but we can check if the hot module reload exists
            if (import.meta.hot && !connectionLost) {
              console.log("ViteConnectionGuard: HMR connection appears to be restored");
              
              // Wait a bit for everything to initialize properly
              setTimeout(() => {
                restoreAuthState();
              }, 500);
              
              // Clear interval if we're reconnected
              if (reconnectCheckInterval) {
                clearInterval(reconnectCheckInterval);
                reconnectCheckInterval = null;
              }
            }
          } catch (e) {
            // Ignore errors during reconnection attempts
          }
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
  
  // Function to restore authentication state with server verification
  const restoreAuthState = async () => {
    const savedUser = sessionStorage.getItem('vite_connection_user');
    if (savedUser) {
      try {
        console.log("ViteConnectionGuard: Restoring authentication state");
        const userData = JSON.parse(savedUser);
        
        // First update the client cache immediately
        queryClient.setQueryData(["/api/user"], userData);
        
        // Then verify with server that session is still valid (but don't wait for it to show UI)
        if (userData && userData.firebaseUid) {
          console.log("ViteConnectionGuard: Verifying session with server");
          fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: userData.firebaseUid,
              refreshToken: Date.now() // Add timestamp to prevent caching
            }),
            credentials: 'include'
          })
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              console.warn(`ViteConnectionGuard: Server returned ${response.status} status`);
              throw new Error(`Session invalid: ${response.status}`);
            })
            .then(data => {
              console.log("ViteConnectionGuard: Server confirmed session is valid");
              if (data && data.user) {
                // Update with server data which might be fresher
                queryClient.setQueryData(["/api/user"], data.user);
              } else {
                console.warn("ViteConnectionGuard: Server response missing user data");
              }
            })
            .catch(err => {
              console.warn("ViteConnectionGuard: Server session validation failed", err);
              // Fallback to firebase direct check
              import("./firebase").then(({ auth }) => {
                if (auth.currentUser) {
                  console.log("ViteConnectionGuard: Firebase auth is still valid, using cached data");
                  // We have a valid Firebase session even if the server session is invalid
                  // Keep the UI working with cached data
                } else {
                  console.warn("ViteConnectionGuard: Both server and Firebase sessions invalid");
                  // Clear invalid data
                  queryClient.setQueryData(["/api/user"], null);
                  sessionStorage.removeItem('vite_connection_user');
                  localStorage.removeItem('vite_connection_user_backup');
                }
              });
            });
        }
        
        console.log("ViteConnectionGuard: Authentication state restored successfully");
      } catch (error) {
        console.error("ViteConnectionGuard: Failed to restore authentication", error);
      }
    }
  };
  
  // Check if we have stored data from a previous connection loss
  const checkForStoredAuth = () => {
    // First check sessionStorage (for HMR and soft reloads)
    const savedUser = sessionStorage.getItem('vite_connection_user');
    if (savedUser) {
      console.log("ViteConnectionGuard: Found stored auth state in sessionStorage, attempting to restore");
      setTimeout(() => {
        restoreAuthState();
      }, 500);
      return;
    }
    
    // If nothing in sessionStorage, check localStorage backup (for hard refreshes/crashes)
    const backupData = localStorage.getItem('vite_connection_user_backup');
    if (backupData) {
      try {
        const data = JSON.parse(backupData);
        const timestamp = data.timestamp;
        const now = Date.now();
        const hoursSince = (now - timestamp) / (1000 * 60 * 60);
        
        // Only use backup data if it's less than 24 hours old
        if (hoursSince < 24 && data.user) {
          console.log("ViteConnectionGuard: Found backup auth state in localStorage, attempting to restore");
          // Copy to sessionStorage for our normal restore process
          sessionStorage.setItem('vite_connection_user', JSON.stringify(data.user));
          setTimeout(() => {
            restoreAuthState();
          }, 500);
        } else if (hoursSince >= 24) {
          // Clean up old backup data
          console.log("ViteConnectionGuard: Backup auth state is too old, cleaning up");
          localStorage.removeItem('vite_connection_user_backup');
        }
      } catch (e) {
        console.error("ViteConnectionGuard: Error parsing backup data", e);
        localStorage.removeItem('vite_connection_user_backup');
      }
    }
  };
  
  // Register event listeners
  window.addEventListener('error', handleError);
  window.addEventListener('message', handleMessage);
  
  // Check on initialization
  checkForStoredAuth();
  
  // Also check connection immediately to ensure server is up
  fetch('/api/health', { cache: 'no-store' })
    .then(response => {
      if (response.ok) {
        console.log("ViteConnectionGuard: Initial server health check passed");
        // Let the application know server is available
        window.setTimeout(() => {
          try {
            import('./queryClient').then(({ networkStatus }) => {
              networkStatus.setServerStatus(true);
            });
          } catch (e) {
            console.warn("Failed to update network status:", e);
          }
        }, 0);
      } else {
        console.warn("ViteConnectionGuard: Initial server health check failed with status", response.status);
        // Let the application know server is not available
        window.setTimeout(() => {
          try {
            import('./queryClient').then(({ networkStatus }) => {
              networkStatus.setServerStatus(false);
            });
          } catch (e) {
            console.warn("Failed to update network status:", e);
          }
        }, 0);
      }
    })
    .catch(error => {
      console.warn("ViteConnectionGuard: Initial server health check failed", error);
      // Let the application know server is not available
      window.setTimeout(() => {
        try {
          import('./queryClient').then(({ networkStatus }) => {
            networkStatus.setServerStatus(false);
          });
        } catch (e) {
          console.warn("Failed to update network status:", e);
        }
      }, 0);
    });
  
  // Setup unload handler to preserve state on page refresh/reload
  window.addEventListener('beforeunload', () => {
    const user = queryClient.getQueryData(["/api/user"]);
    if (user) {
      console.log("ViteConnectionGuard: Saving auth state before page unload");
      // Save to both storage types for resilience
      sessionStorage.setItem('vite_connection_user', JSON.stringify(user));
      localStorage.setItem('vite_connection_user_backup', JSON.stringify({
        user,
        timestamp: Date.now()
      }));
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