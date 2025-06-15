import { createRoot } from "react-dom/client";
import App from "./AppSimple";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { initViteConnectionGuard } from "./lib/viteConnectionGuard";
import { Component, ErrorInfo, ReactNode, useEffect } from "react";
import { addResetButton, resetApplicationState } from "./lib/appReset";
import { initPWA } from "./lib/pwaUtils";

// Global polyfill for the Network object to fix the "Can't find variable: Network" error
// This is a workaround for the Vite plugin error without modifying vite.config.ts
// @ts-ignore
window.Network = window.Network || { 
  isOnline: () => navigator.onLine,
  addEventListener: () => {},
  removeEventListener: () => {}
};

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

// Enhanced error handler for uncaught errors with detailed logging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Specifically watch for Network-related errors and prevent them from crashing the app
  if (event.message && (
      event.message.includes('Network') || 
      event.message.includes('network') ||
      event.message.includes('Can\'t find variable')
    )) {
    console.warn('Intercepted potential Network error:', event.message);
    console.warn('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.toString() : 'No error object'
    });
    
    // Prevent the error from bubbling up if it's our targeted Network error
    if (event.message.includes('Can\'t find variable: Network')) {
      console.log('Successfully intercepted Network error, preventing app crash');
      event.preventDefault();
    }
  }
});

// Enhanced error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check if this is our Network-related error
  const reasonStr = String(event.reason);
  if (reasonStr.includes('Network') || reasonStr.includes('network')) {
    console.warn('Intercepted Network-related promise rejection:', reasonStr);
    event.preventDefault();
  }
});

// Initialize Vite connection guard to prevent logout on server disconnects
try {
  initViteConnectionGuard();
} catch (err) {
  console.error("Failed to initialize connection guard:", err);
}

// App initialization wrapper component with reset functionality and PWA
function AppWithReset() {
  useEffect(() => {
    // Initialize Progressive Web App functionality
    initPWA();
    
    // Add debug reset button in development
    if (import.meta.env.MODE === 'development') {
      addResetButton();
    }
    
    // Setup PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // Store the event so it can be triggered later
      (window as any).deferredPrompt = e;
      console.log('App can be installed! Install prompt available.');
    });
    
    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      console.log('App was installed successfully!');
      // Clear the prompt
      (window as any).deferredPrompt = null;
    });
    
    // Handle online/offline status with PWA support
    window.addEventListener('online', () => {
      console.log('App is back online');
      // Try to reload cached resources if we're now online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ONLINE',
          timestamp: new Date().getTime()
        });
      }
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
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
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
