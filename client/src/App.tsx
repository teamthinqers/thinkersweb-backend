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

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();
  const [location, setLocation] = useLocation();
  const [retryCounter, setRetryCounter] = useState(0);
  const { toast } = useToast();
  
  // If we're already on the dashboard, don't attempt any navigation
  const isOnDashboard = location.startsWith("/dashboard");
  
  // Handle server connection issues during authentication
  useEffect(() => {
    const maxRetries = 3;
    let timeoutId: NodeJS.Timeout;
    
    // Only retry if we have a connection error (not auth error) and still need to retry
    if (error && !networkStatus.serverAvailable && retryCounter < maxRetries) {
      const retryDelay = Math.min(2000 * Math.pow(2, retryCounter), 10000);
      
      // Show toast only on first error
      if (retryCounter === 0 && !isOnDashboard) {
        toast({
          title: "Connection Error",
          description: "We're having trouble connecting to the server. Retrying...",
          variant: "destructive",
        });
      }
      
      timeoutId = setTimeout(() => {
        // Increment retry counter
        setRetryCounter(prev => prev + 1);
        
        // Invalidate query to force refetch
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }, retryDelay);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error, retryCounter, toast, isOnDashboard]);
  
  // Navigate to auth page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Only redirect if:
      // 1. We've reached max retries, OR
      // 2. The server is available (meaning it's a real auth issue), OR
      // 3. There's no error at all (also a real auth issue)
      if ((retryCounter >= 3 || networkStatus.serverAvailable || !error) && !isOnDashboard) {
        // Don't redirect if we had a very recent connection error
        // This helps prevent flashing between auth and loading screens
        if (!networkStatus.hasRecentConnectionError()) {
          // Force to dashboard instead of auth for safety (prevents redirect loops)
          setLocation(isOnDashboard ? "/dashboard" : "/auth");
          
          // Only show toast for non-connection errors (real auth issues)
          if ((networkStatus.serverAvailable || !error) && !isOnDashboard) {
            toast({
              title: "Authentication Required",
              description: "Please sign in to continue",
            });
          }
        }
      }
    }
  }, [user, isLoading, retryCounter, setLocation, toast, error, isOnDashboard, location]);
  
  // Show loading state
  if (isLoading || (error && retryCounter < 3 && !networkStatus.serverAvailable)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        {error && retryCounter < 3 && !networkStatus.serverAvailable && (
          <div className="text-center max-w-md px-4">
            <p className="text-sm text-muted-foreground mb-2">
              Connecting to server... (Attempt {retryCounter + 1}/3)
            </p>
            <ConnectionError 
              title="Reconnecting to Server" 
              message="We're having trouble reaching the server. Retrying automatically..." 
              retryAction={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                setRetryCounter(prev => prev + 1);
              }}
            />
          </div>
        )}
      </div>
    );
  }
  
  if (!user) {
    // Show a simpler loading state instead of null
    // This prevents flashing during authentication
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
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
  
  // Manage authentication-based redirects
  useEffect(() => {
    // Avoid any redirects during initial loading
    if (isLoading) return;
    
    // Wait a moment before redirecting to prevent flickering
    const redirectDelay = setTimeout(() => {
      // If logged in and on landing page, go to dashboard
      if (user && location === "/") {
        console.log("User is logged in and on landing page, redirecting to dashboard");
        setLocation("/dashboard");
      }
      
      // If logged in and on auth page, redirect to dashboard
      if (user && location === "/auth") {
        console.log("User is logged in and on auth page, redirecting to dashboard");
        setLocation("/dashboard");
      }
    }, 300);
    
    return () => clearTimeout(redirectDelay);
  }, [user, isLoading, location, setLocation]);

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

  if (isLandingPage) {
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
  const forceRedirectToDashboard = user && !isDashboardPage && !isLandingPage && !isAuthPage;
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
