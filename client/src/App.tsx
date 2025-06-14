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
import ActivateDotSpark from "@/pages/ActivateDotSpark";
import ActivateNeura from "@/pages/ActivateNeura";
import MyNeura from "@/pages/MyNeura";
import NeuraTuningCore from "@/pages/NeuraTuningCore";
import NeuraTuningCognitive from "@/pages/NeuraTuningCognitive";
import NeuraTuningExpertise from "@/pages/NeuraTuningExpertise";
import NeuraTuningLearning from "@/pages/NeuraTuningLearning";
import CognitiveShieldConfig from "@/pages/CognitiveShieldConfig";

import DotSparkTuningPage from "@/pages/DotSparkTuningPage";
import DotSparkCapacityPage from "@/pages/DotSparkCapacityPage";
import SectionedDotSparkTuningPage from "@/pages/SectionedDotSparkTuningPage";
import DotSparkTuningUnified from "@/pages/DotSparkTuningUnified";
import PwaDebugger from "@/pages/PwaDebugger";
import PwaInstallGuide from "@/pages/PwaInstallGuide";
import Testing from "@/pages/Testing";
import ChatPage from "@/pages/chat-page";
import QuickCapture from "@/pages/QuickCapture";
import DotInstall from "@/pages/DotInstall";
import DotCapture from "@/pages/DotCapture";
import AppLayout from "@/components/layout/AppLayout";
import EntryDetail from "@/components/entries/EntryDetail";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { GlobalFloatingDot } from "@/components/dotspark/GlobalFloatingDot";
import { PWAFloatingDot } from "@/components/dotspark/PWAFloatingDot";
import { neuraStorage } from "@/lib/neuraStorage";
import { Loader2 } from "lucide-react";
import MockDashboard from "@/components/dashboard/MockDashboard";
import { PWAInstallButton } from "@/components/ui/pwa-install-button";
import { IosPwaInstallPrompt } from "@/components/ui/ios-pwa-install-prompt";
import { isRunningAsStandalone } from "@/lib/pwaUtils";

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
      <Route path="/quick-capture" component={QuickCapture} />
      <Route path="/dot" component={DotCapture} />
      <Route path="/dot-install" component={DotInstall} />
      <Route path="/activate" component={ActivateDotSpark} />
      <Route path="/activate-dotspark" component={ActivateDotSpark} />
      <Route path="/activate-neura">
        {() => <MyNeura />}
      </Route>
      <Route path="/my-neura" component={MyNeura} />
      <Route path="/neura" component={MyNeura} />
      {/* DotSpark tuning section pages - Order: Core, Cognitive, Learning, Expertise */}
      <Route path="/dotspark-tuning/core" component={NeuraTuningCore} />
      <Route path="/dotspark-tuning/cognitive" component={NeuraTuningCognitive} />
      <Route path="/dotspark-tuning/learning" component={NeuraTuningLearning} />  
      <Route path="/dotspark-tuning/expertise" component={NeuraTuningExpertise} />
      {/* Legacy Neura routes for backwards compatibility */}
      <Route path="/neura-tuning/core" component={NeuraTuningCore} />
      <Route path="/neura-tuning/cognitive" component={NeuraTuningCognitive} />
      <Route path="/neura-tuning/learning" component={NeuraTuningLearning} />  
      <Route path="/neura-tuning/expertise" component={NeuraTuningExpertise} />
      <Route path="/neura-tuning-cognitive" component={NeuraTuningCognitive} />
      <Route path="/cognitive-shield-config" component={NeuraTuningCognitive} />

      {/* Legacy routes - all redirecting to My Neura page */}
      <Route path="/dotspark-tuning">
        {() => <MyNeura />}
      </Route>
      <Route path="/sectioned-dotspark-tuning">
        {() => <MyNeura />}
      </Route>
      <Route path="/neural-tuning">
        {() => <MyNeura />}
      </Route>
      <Route path="/dotspark-capacity" component={DotSparkCapacityPage} />
      <Route path="/neural-capacity" component={DotSparkCapacityPage} /> {/* Legacy route */}
      <Route path="/pwa-debug" component={PwaDebugger} />
      <Route path="/install-guide" component={PwaInstallGuide} />
      <Route path="/testing" component={Testing} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [isDotSparkActive, setIsDotSparkActive] = useState(false);
  
  // Check DotSpark activation status and listen for changes
  useEffect(() => {
    // Initial check
    const checkActivation = () => {
      const isActive = neuraStorage.isActivated();
      console.log('DotSpark activation check:', isActive);
      setIsDotSparkActive(isActive);
    };
    
    checkActivation();
    
    // Check periodically to ensure we catch activation changes
    const interval = setInterval(checkActivation, 1000);
    
    // Listen for storage changes (when DotSpark is activated/deactivated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'neuraActivated') {
        checkActivation();
      }
    };
    
    // Listen for custom events from neuraStorage
    const handleNeuraStateChange = (e: CustomEvent) => {
      console.log('Neura state changed event:', e.detail.activated);
      setIsDotSparkActive(e.detail.activated);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('neura-state-changed', handleNeuraStateChange as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('neura-state-changed', handleNeuraStateChange as EventListener);
    };
  }, []);
  
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
  
  // Listen for network-related errors and show a warning banner
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      // Check if this is our Network-related error
      if (event.message && (
          event.message.includes('Network') || 
          event.message.includes('network') ||
          event.message.includes('Can\'t find variable: Network')
        )) {
        // Show the warning banner
        setShowNetworkWarning(true);
        
        // Prevent the default error handling if it's our specific error
        if (event.message.includes('Can\'t find variable: Network')) {
          event.preventDefault();
        }
      }
    };
    
    // Add the error handler
    window.addEventListener('error', errorHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {showNetworkWarning && (
          <div className="fixed top-0 left-0 right-0 p-2 bg-amber-500 text-black z-50 text-center text-sm">
            <p>
              Network module warning detected. Visit the <a href="/pwa-debug" className="underline font-bold">PWA Debugger</a> for help.
              <button 
                className="ml-2 px-2 py-0.5 bg-black text-white rounded-sm text-xs"
                onClick={() => setShowNetworkWarning(false)}
              >
                Dismiss
              </button>
            </p>
          </div>
        )}
        <Router />
        <Toaster />
        {/* Global Floating Dot for Desktop Browser Users */}
        {!isRunningAsStandalone() && (
          <GlobalFloatingDot isActive={isDotSparkActive || neuraStorage.isActivated()} />
        )}
        {/* PWA Floating Dot for Standalone PWA Mode */}
        {isRunningAsStandalone() && (
          <PWAFloatingDot isActive={isDotSparkActive || neuraStorage.isActivated()} />
        )}
        {/* iOS PWA Install Prompt */}
        <IosPwaInstallPrompt />
        {/* PWA Install Floating Button (only visible when installable) */}
        <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50">
          <PWAInstallButton size="lg" className="w-full md:w-auto" />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;