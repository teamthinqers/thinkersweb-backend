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
import { Loader2 } from "lucide-react";
import { ConnectionError } from "@/components/ui/connection-error";
import { useToast } from "@/hooks/use-toast";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();
  const [retryCounter, setRetryCounter] = useState(0);
  const { toast } = useToast();
  
  // Handle server connection issues during authentication
  useEffect(() => {
    const maxRetries = 3;
    let timeoutId: NodeJS.Timeout;
    
    if (error && !networkStatus.serverAvailable && retryCounter < maxRetries) {
      const retryDelay = Math.min(2000 * Math.pow(2, retryCounter), 10000);
      
      // Show toast only on first error
      if (retryCounter === 0) {
        toast({
          title: "Authentication Error",
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
  }, [error, retryCounter, toast]);
  
  // Navigate to auth page if not authenticated
  useEffect(() => {
    if (!isLoading && !user && retryCounter >= 3) {
      setLocation("/auth");
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue",
      });
    }
  }, [user, isLoading, retryCounter, setLocation, toast]);
  
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
            />
          </div>
        )}
      </div>
    );
  }
  
  if (!user) {
    return null;
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

function Router() {
  const [location] = useLocation();
  const isLandingPage = location === "/";
  const isAuthPage = location === "/auth";

  if (isLandingPage) {
    return <LandingPage />;
  }

  if (isAuthPage) {
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
