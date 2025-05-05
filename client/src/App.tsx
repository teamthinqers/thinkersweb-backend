import { Switch, Route, useLocation } from "wouter";
import { queryClient, networkStatus } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AllEntries from "@/pages/AllEntries";
import Insights from "@/pages/Insights";
import Favorites from "@/pages/Favorites";
import Network from "@/pages/Network";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/auth-page";
import Settings from "@/pages/Settings";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import EntryDetail from "@/components/entries/EntryDetail";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2, ServerCrash } from "lucide-react";
import { ConnectionError } from "@/components/ui/connection-error";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Add a global flag for intentional navigation to home/landing page
declare global {
  interface Window {
    INTENTIONAL_HOME_NAVIGATION: boolean;
  }
}
// Initialize it if not already set
window.INTENTIONAL_HOME_NAVIGATION = window.INTENTIONAL_HOME_NAVIGATION || false;

// Protected route component with auto-restore feature
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, loginWithGoogle } = useAuth();
  const [location, setLocation] = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [autoRestoreAttempted, setAutoRestoreAttempted] = useState(false);
  const [restorationInProgress, setRestorationInProgress] = useState(false);
  const { toast } = useToast();

  // If we're already on the dashboard, don't attempt any navigation
  const isOnDashboard = location.startsWith("/dashboard");

  // First, try to auto-restore session if we have stored data
  useEffect(() => {
    // Only attempt auto-restore once, when not loading and no user
    if (!isLoading && !user && !autoRestoreAttempted && !restorationInProgress) {
      setAutoRestoreAttempted(true);
      
      // Check if we have stored user data
      const storedData = localStorage.getItem('dotspark_user_data');
      if (storedData) {
        try {
          const userData = JSON.parse(storedData);
          const lastAuth = new Date(userData.lastAuthenticated);
          const now = new Date();
          const hoursSinceAuth = (now.getTime() - lastAuth.getTime()) / (1000 * 60 * 60);
          
          // If less than 72 hours since last authentication, attempt auto-restore
          if (hoursSinceAuth < 72) {
            console.log("Found recent authentication data, attempting session restoration");
            setRestorationInProgress(true);
            
            // Show login prompt for a smoother user experience
            setShowLoginPrompt(true);
          } else {
            console.log("Stored authentication data too old, not attempting auto-restore");
            // Navigate to auth for a fresh login
            if (!window.INTENTIONAL_HOME_NAVIGATION && !isOnDashboard) {
              setTimeout(() => setLocation("/auth"), 500);
            }
          }
        } catch (e) {
          console.error("Failed to parse stored user data:", e);
          localStorage.removeItem('dotspark_user_data');
          // Navigate to auth
          if (!window.INTENTIONAL_HOME_NAVIGATION && !isOnDashboard) {
            setTimeout(() => setLocation("/auth"), 500);
          }
        }
      } else {
        console.log("No stored user data found, regular authentication required");
        // Navigate to auth
        if (!window.INTENTIONAL_HOME_NAVIGATION && !isOnDashboard) {
          setTimeout(() => setLocation("/auth"), 500);
        }
      }
    }
  }, [isLoading, user, autoRestoreAttempted, restorationInProgress, setLocation, isOnDashboard]);

  // Handler for automatic login
  const handleAutomaticLogin = async () => {
    try {
      toast({
        title: "Restoring Session",
        description: "Attempting to restore your previous session...",
      });
      
      await loginWithGoogle();
      console.log("Session restore successful");
      
      toast({
        title: "Welcome back!",
        description: "Your session has been restored successfully.",
      });
      
      setShowLoginPrompt(false);
      setRestorationInProgress(false);
    } catch (error) {
      console.error("Session restore failed:", error);
      
      toast({
        title: "Session expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      
      setShowLoginPrompt(false);
      setRestorationInProgress(false);
      
      // Navigate to auth
      if (!window.INTENTIONAL_HOME_NAVIGATION && !isOnDashboard) {
        setTimeout(() => setLocation("/auth"), 500);
      }
    }
  };

  // Manual navigation to auth when needed
  useEffect(() => {
    // Only if we're done with all attempts and still have no user
    if (!isLoading && !user && autoRestoreAttempted && !restorationInProgress && !showLoginPrompt) {
      // Check if we're on a protected route that needs auth
      if (!window.INTENTIONAL_HOME_NAVIGATION && !isOnDashboard && !location.startsWith("/auth")) {
        console.log("Authentication required for this route, navigating to auth page");
        setTimeout(() => setLocation("/auth"), 500);
      }
    }
  }, [isLoading, user, autoRestoreAttempted, restorationInProgress, showLoginPrompt, location, setLocation, isOnDashboard]);

  // Show session restore prompt
  if (showLoginPrompt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back!</h2>
          <p className="mb-6 text-center">
            We noticed you were previously logged in. Would you like to restore your session?
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleAutomaticLogin} className="w-32">
              Restore
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowLoginPrompt(false);
                setRestorationInProgress(false);
                setLocation("/auth");
              }}
              className="w-32"
            >
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state during any loading/restoration process
  if (isLoading || restorationInProgress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">
          {restorationInProgress ? "Restoring your session..." : "Loading..."}
        </p>
      </div>
    );
  }

  // If no user after all attempts, show loading until redirected
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Preparing your experience...</p>
      </div>
    );
  }
  
  // User is authenticated, show the protected content
  return <>{children}</>;
}

function AppWithLayout() {
  const [showEntryDetail, setShowEntryDetail] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);

  const openEntryDetail = (id: number) => {
    setCurrentEntryId(id);
    setShowEntryDetail(true);
  };

  const closeEntryDetail = () => {
    setShowEntryDetail(false);
    setCurrentEntryId(null);
  };

  const openNewEntryForm = () => {
    setCurrentEntryId(null);
    setShowEntryForm(true);
  };

  const openEditEntryForm = (id: number) => {
    setCurrentEntryId(id);
    setShowEntryForm(true);
  };

  const closeEntryForm = () => {
    setShowEntryForm(false);
    setCurrentEntryId(null);
  };

  return (
    <ProtectedRoute>
      <AppLayout onNewEntry={openNewEntryForm}>
        <Switch>
          <Route path="/dashboard" component={() => <Dashboard onEntryClick={openEntryDetail} />} />
          <Route path="/entries" component={() => <AllEntries onEntryClick={openEntryDetail} />} />
          <Route path="/insights" component={Insights} />
          <Route path="/favorites" component={() => <Favorites onEntryClick={openEntryDetail} />} />
          <Route path="/network" component={Network} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>

        {showEntryDetail && currentEntryId && (
          <EntryDetail 
            entryId={currentEntryId} 
            isOpen={showEntryDetail} 
            onClose={closeEntryDetail} 
            onEdit={openEditEntryForm} 
          />
        )}

        <ChatEntryForm 
          isOpen={showEntryForm} 
          onClose={closeEntryForm} 
        />
      </AppLayout>
    </ProtectedRoute>
  );
}

// Dedicated component to handle Dashboard redirection
function DashboardRedirect() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect to dashboard with a small delay
    const redirectTimer = setTimeout(() => {
      setLocation("/dashboard");
      toast({
        title: "Welcome Back",
        description: "Redirecting you to your dashboard...",
      });
    }, 500);
    
    return () => clearTimeout(redirectTimer);
  }, [setLocation, toast]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-center text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const isLandingPage = location === "/";
  const isAuthPage = location === "/auth";
  const isDashboardPage = location.startsWith("/dashboard");
  const { toast } = useToast();
  
  // Track intentional navigation to home from dashboard
  const [intentionalHomeNavigation, setIntentionalHomeNavigation] = useState(false);
  
  // Listen for navigation events that could be home navigation
  useEffect(() => {
    // If landing page is accessed directly, mark as intentional
    if (location === "/" && !isLandingPage) {
      console.log("Setting intentional home navigation flag");
      setIntentionalHomeNavigation(true);
      
      // Reset the flag after 5 seconds
      const resetTimer = setTimeout(() => {
        setIntentionalHomeNavigation(false);
      }, 5000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [location, isLandingPage]);
  
  // Handle home button clicks via URL changes and custom events
  useEffect(() => {
    // Listen for URL changes that might be initiated by our home button
    const handleUrlChange = () => {
      if (window.location.pathname === "/") {
        console.log("URL changed to home, marking as intentional navigation");
        setIntentionalHomeNavigation(true);
        window.INTENTIONAL_HOME_NAVIGATION = true;
        
        // Reset the flag after 5 seconds
        setTimeout(() => {
          setIntentionalHomeNavigation(false);
          window.INTENTIONAL_HOME_NAVIGATION = false;
        }, 5000);
      }
    };
    
    // Listen for our custom intentional navigation event
    const handleIntentionalNavigation = (event: Event) => {
      console.log("Received intentional home navigation event", (event as CustomEvent).detail);
      setIntentionalHomeNavigation(true);
      window.INTENTIONAL_HOME_NAVIGATION = true;
      
      // Reset the flag after 5 seconds
      setTimeout(() => {
        setIntentionalHomeNavigation(false);
        window.INTENTIONAL_HOME_NAVIGATION = false;
      }, 5000);
    };
    
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("intentionalHomeNavigation", handleIntentionalNavigation);
    
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("intentionalHomeNavigation", handleIntentionalNavigation);
    };
  }, []);

  // Manage authentication-based redirects
  useEffect(() => {
    // Avoid any redirects during initial loading
    if (isLoading) return;
    
    // Skip redirects if intentional navigation to home
    if (intentionalHomeNavigation && location === "/") {
      console.log("Skipping dashboard redirect due to intentional home navigation");
      return;
    }
    
    // Wait a moment before redirecting to prevent flickering
    const redirectDelay = setTimeout(() => {
      // If logged in and on landing page, go to dashboard (unless intentional)
      if (user && location === "/" && !intentionalHomeNavigation) {
        console.log("User is logged in and on landing page, redirecting to dashboard");
        setLocation("/dashboard");
      }
      
      // If logged in and on auth page, redirect to dashboard (always)
      if (user && location === "/auth") {
        console.log("User is logged in and on auth page, redirecting to dashboard");
        setLocation("/dashboard");
      }
    }, 300);
    
    return () => clearTimeout(redirectDelay);
  }, [user, isLoading, location, setLocation, intentionalHomeNavigation]);

  // Redirect to auth page if trying to access protected pages without being logged in
  useEffect(() => {
    // Check if user is trying to access dashboard or other protected routes
    const isProtectedRoute = isDashboardPage || 
                             location.startsWith("/entries") || 
                             location.startsWith("/insights") || 
                             location.startsWith("/favorites") || 
                             location.startsWith("/network") || 
                             location.startsWith("/settings");
                             
    // Only redirect if not already on auth page, not on landing page, and if auth check is complete
    if (!user && !isLoading && isProtectedRoute && !isAuthPage && !isLandingPage) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the dashboard",
      });
      setLocation("/auth");
    }
  }, [user, isLoading, location, isAuthPage, isLandingPage, isDashboardPage, setLocation, toast]);

  // Allow accessing landing page when it's intentional or not authenticated
  if (isLandingPage && (intentionalHomeNavigation || !user)) {
    console.log("Showing landing page due to intentional navigation or no authentication");
    return <LandingPage />;
  }

  if (isAuthPage) {
    // Don't show auth page if already logged in
    if (user && !isLoading) {
      return <DashboardRedirect />;
    }
    return <AuthPage />;
  }
  
  // Special case to ensure we always have a place to land if we're logged in
  // But explicitly allow landing page access when it's intentional navigation
  const forceRedirectToDashboard = user && !isDashboardPage && !isLandingPage && !isAuthPage && 
    !(intentionalHomeNavigation && location === "/");
  if (forceRedirectToDashboard) {
    return <DashboardRedirect />;
  }
  
  // If user is trying to access protected routes without being logged in, show auth page
  const accessingProtectedRouteWithoutAuth = !user && 
    (isDashboardPage || 
     location.startsWith("/entries") || 
     location.startsWith("/insights") || 
     location.startsWith("/favorites") || 
     location.startsWith("/network") || 
     location.startsWith("/settings"));
     
  if (accessingProtectedRouteWithoutAuth) {
    // This is a fallback in case the useEffect redirect doesn't trigger
    return <AuthPage />;
  }

  return <AppWithLayout />;
}

// Connection Error Monitor component
function ConnectionErrorMonitor() {
  const { toast } = useToast();
  const [showConnectionError, setShowConnectionError] = useState(false);
  
  // Monitor network status changes
  useEffect(() => {
    // Show connection error banner
    const handleNetworkChange = () => {
      if (!networkStatus.serverAvailable || !networkStatus.isOnline) {
        setShowConnectionError(true);
        
        // Show toast notification on first connection error
        if (networkStatus.connectionAttempts === 1) {
          toast({
            title: "Connection Issue",
            description: !networkStatus.isOnline 
              ? "You appear to be offline. Please check your internet connection." 
              : "We're having trouble connecting to the server. Retrying...",
            variant: "destructive",
          });
        }
      } else {
        // If connection is restored, hide error after a delay
        setTimeout(() => {
          setShowConnectionError(false);
        }, 1500);
        
        // Only show success toast if we had an error before
        if (showConnectionError) {
          toast({
            title: "Connection Restored",
            description: "Your connection has been restored.",
          });
        }
      }
    };
    
    // Subscribe to network status changes
    const unsubscribe = networkStatus.addListener(handleNetworkChange);
    
    // Initial check
    handleNetworkChange();
    
    return () => {
      unsubscribe();
    };
  }, [toast, showConnectionError]);
  
  if (!showConnectionError) return null;
  
  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <ConnectionError />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <ConnectionErrorMonitor />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
