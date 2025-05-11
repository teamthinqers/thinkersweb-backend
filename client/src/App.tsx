import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AllEntries from "@/pages/AllEntries";
import Insights from "@/pages/Insights";
import Favorites from "@/pages/Favorites";
import Network from "@/pages/Network";
import LandingPage from "@/pages/LandingPage";
import LogoPage from "@/pages/LogoPage";
import AuthPage from "@/pages/auth-page";
import Settings from "@/pages/Settings";
import WhatsAppAdmin from "@/pages/WhatsAppAdmin";
import WhatsAppTest from "@/pages/WhatsAppTest";
import WhatsAppEntries from "@/pages/WhatsAppEntries";
import FixedEntries from "@/pages/FixedEntries";
import ActivateNeuralExtension from "@/pages/ActivateNeuralExtension";
import Testing from "@/pages/Testing";
import AppLayout from "@/components/layout/AppLayout";
import EntryDetail from "@/components/entries/EntryDetail";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import MockDashboard from "@/components/dashboard/MockDashboard";

// Simplified Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If no user, show loading until redirected
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Redirecting...</p>
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
  const [location] = useLocation();

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

  // Determine which content to show based on the current location
  const renderContent = () => {
    switch (location) {
      case '/dashboard':
        return <Dashboard onEntryClick={openEntryDetail} onNewEntry={openNewEntryForm} />;
      case '/entries':
        return <AllEntries onEntryClick={openEntryDetail} />;
      case '/insights':
        return <Insights />;
      case '/favorites':
        return <Favorites onEntryClick={openEntryDetail} />;
      case '/network':
        return <Network />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard onEntryClick={openEntryDetail} onNewEntry={openNewEntryForm} />;
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout onNewEntry={openNewEntryForm}>
        {renderContent()}

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
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Show a Loading component while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Dashboard route - shows mock dashboard if user is not authenticated */}
      <Route path="/dashboard">
        {user ? <AppWithLayout /> : <MockDashboard />}
      </Route>
      
      {/* Other protected routes */}
      <Route path="/entries" component={() => <AppWithLayout />} />
      <Route path="/insights" component={() => <AppWithLayout />} />
      <Route path="/favorites" component={() => <AppWithLayout />} />
      <Route path="/network" component={() => <AppWithLayout />} />
      <Route path="/settings" component={() => <AppWithLayout />} />
      <Route path="/whatsapp-admin" component={WhatsAppAdmin} />
      <Route path="/whatsapp-test" component={WhatsAppTest} />
      <Route path="/whatsapp-entries" component={WhatsAppEntries} />
      <Route path="/fixed-entries" component={FixedEntries} />
      <Route path="/logo" component={LogoPage} />
      <Route path="/activate" component={ActivateNeuralExtension} />
      <Route path="/activate-neural" component={ActivateNeuralExtension} />
      <Route path="/testing" component={Testing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check for WhatsApp redirect on initial load
  useEffect(() => {
    // Check if we have a pending WhatsApp redirect
    const redirectTarget = sessionStorage.getItem('redirectAfterWhatsApp');
    const redirectExpiry = sessionStorage.getItem('redirectAfterWhatsAppExpires');
    
    if (redirectTarget && redirectExpiry) {
      // Check if the redirect is still valid (not expired)
      const expiryTime = parseInt(redirectExpiry, 10);
      const now = Date.now();
      
      if (now < expiryTime) {
        console.log(`Redirecting to ${redirectTarget} after WhatsApp interaction`);
        
        // Clear the redirect data
        sessionStorage.removeItem('redirectAfterWhatsApp');
        sessionStorage.removeItem('redirectAfterWhatsAppExpires');
        
        // Add a flag to show that we're coming back from WhatsApp
        sessionStorage.setItem('returningFromWhatsApp', 'true');
        
        // Redirect to the target page
        window.location.href = `/${redirectTarget}`;
      } else {
        // Clear expired redirect data
        sessionStorage.removeItem('redirectAfterWhatsApp');
        sessionStorage.removeItem('redirectAfterWhatsAppExpires');
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;