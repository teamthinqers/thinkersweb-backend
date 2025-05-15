import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { initViteConnectionGuard } from "./lib/viteConnectionGuard";
import { Component, ErrorInfo, ReactNode, useEffect } from "react";
import { addResetButton, resetApplicationState } from "./lib/appReset";

// Error boundary component to prevent the entire app from crashing
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error);
    console.error("Error Details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h2>
            <p className="mb-4">We're experiencing technical difficulties. Please try one of the options below.</p>
            {this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mb-4 overflow-auto">
                <p>{this.state.error.toString()}</p>
              </div>
            )}
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button 
                onClick={() => resetApplicationState("/")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reset Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Store authentication state before hot reload
if (import.meta.hot) {
  // Save authentication state before hot updates
  import.meta.hot.dispose(() => {
    try {
      // Get current user from React Query cache
      const currentUser = queryClient.getQueryData(["/api/user"]);
      
      // Store it in sessionStorage which persists during HMR but is cleared on full refresh
      if (currentUser) {
        console.log("HMR: Storing auth state before hot update");
        sessionStorage.setItem('hmr_auth_state', JSON.stringify(currentUser));
      }
    } catch (err) {
      console.error("Error during HMR dispose:", err);
    }
  });
  
  // Restore authentication state after hot updates
  import.meta.hot.accept(() => {
    try {
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
    } catch (err) {
      console.error("Error during HMR accept:", err);
    }
  });
}

// Initialize error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Initialize error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize Vite connection guard to prevent logout on server disconnects
try {
  initViteConnectionGuard();
} catch (err) {
  console.error("Failed to initialize connection guard:", err);
}

// App initialization wrapper component with reset functionality
function AppWithReset() {
  useEffect(() => {
    // Add debug reset button in development
    if (import.meta.env.MODE === 'development') {
      addResetButton();
    }
    
    // Handle online/offline status manually without PWA
    window.addEventListener('online', () => {
      console.log('App is back online');
    });
    
    window.addEventListener('offline', () => {
      console.log('App is now offline');
    });
    
    // Check if we need to reset app state (user added ?reset=true to URL)
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      // Remove the reset param to avoid infinite resets
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('reset');
      window.history.replaceState({}, '', newUrl);
      
      // Execute app reset
      resetApplicationState(window.location.pathname);
      return;
    }
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);
  
  return <App />;
}

// Create the application root element
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AppWithReset />
  </ErrorBoundary>
);
