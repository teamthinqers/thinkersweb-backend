import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AllEntries from "@/pages/AllEntries";
import Insights from "@/pages/Insights";
import Favorites from "@/pages/Favorites";
import Network from "@/pages/Network";
import LandingPage from "@/pages/LandingPage";
import MyNeuraPage from "@/pages/MyNeuraPage";
import NewLandingPage from "@/pages/NewLandingPage";
import HomePage from "@/pages/HomePage";
import PreviewPage from "@/pages/PreviewPage";
import SocialFeedPage from "@/pages/SocialFeedPage";
import CognitiveIdentityPage from "@/pages/CognitiveIdentityPage";
import LearningEnginePage from "@/pages/LearningEnginePage";
import LogoPage from "@/pages/LogoPage";
import AuthPage from "@/pages/auth-page";
import NotificationsPage from "@/pages/NotificationsPage";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import PublicProfile from "@/pages/PublicProfile";
import MyDotSparkPage from "@/pages/MyDotSparkPage";
import ThoughtCirclePage from "@/pages/ThoughtCirclePage";
import ThinQCirclePage from "@/pages/ThinQCirclePage";
import JoinCircleInvitePage from "@/pages/JoinCircleInvitePage";
import WhatsAppAdmin from "@/pages/WhatsAppAdmin";
import WhatsAppTest from "@/pages/WhatsAppTest";
import WhatsAppEntries from "@/pages/WhatsAppEntries";
import FixedEntries from "@/pages/FixedEntries";
import ActivateDotSpark from "@/pages/ActivateDotSpark";
import ActivateNeura from "@/pages/ActivateNeura";
import MyNeura from "@/pages/MyNeura";
import NeuraTuningCore from "@/pages/NeuraTuningCore";
import CognitiveIdentityConfig from "@/pages/CognitiveIdentityConfig";
import NeuraTuningExpertise from "@/pages/NeuraTuningExpertise";
import NeuraTuningLearning from "@/pages/NeuraTuningLearning";

import DotSparkTuningPage from "@/pages/DotSparkTuningPage";
import DotSparkCapacityPage from "@/pages/DotSparkCapacityPage";
import SectionedDotSparkTuningPage from "@/pages/SectionedDotSparkTuningPage";
import DotSparkTuningUnified from "@/pages/DotSparkTuningUnified";
import PwaDebugger from "@/pages/PwaDebugger";
import PwaInstallGuide from "@/pages/PwaInstallGuide";
import Testing from "@/pages/Testing";
import TestCreation from "@/pages/TestCreation";
import { QuickAuthTest } from "@/pages/QuickAuthTest";

import WorkingDot from "@/pages/working-dot";
import TestComplete from "@/pages/TestComplete";
import { WorkingDotTest } from "@/pages/WorkingDotTest";
import IntelligenceClassification from "@/components/IntelligenceClassification";
import ChatPage from "@/pages/chat-page";
import QuickCapture from "@/pages/QuickCapture";
import DotInstall from "@/pages/DotInstall";
import DotCapture from "@/pages/DotCapture";
import Social from "@/pages/Social";
import SparkTest from "@/pages/SparkTest";
import Spark from "@/pages/Spark";
import SimpleAuthTest from "@/pages/SimpleAuthTest";
import AuthVerificationTest from "@/pages/AuthVerificationTest";
import AppLayout from "@/components/layout/AppLayout";
import EntryDetail from "@/components/entries/EntryDetail";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import EnhancedChatInterface from "@/components/chat/EnhancedChatInterface";
import IntelligentVectorChat from "@/components/IntelligentVectorChat";
import CognitiveAnalysisInterface from "@/components/CognitiveAnalysisInterface";
import IntelligentConversationalChat from "@/components/IntelligentConversationalChat";
import AdvancedDotSparkChat from "@/components/AdvancedDotSparkChat";
import IntelligenceSelector from "@/components/IntelligenceSelector";
import IndexingDemo from "@/pages/IndexingDemo";
import ActivationPage from "@/pages/ActivationPage";
import ProductionTest from "@/pages/ProductionTest";
import VectorMigrationTest from "@/pages/VectorMigrationTest";
import AuthTest from "@/pages/AuthTest";

import { neuraStorage } from "@/lib/neuraStorage";
import { Loader2 } from "lucide-react";
import { useAuth, AuthProvider } from "@/hooks/use-auth-new";
import { AuthInitializer } from "@/components/AuthProvider";

import { PWAInstallButton } from "@/components/ui/pwa-install-button";
import { IosPwaInstallPrompt } from "@/components/ui/ios-pwa-install-prompt";
import { isRunningAsStandalone } from "@/lib/pwaUtils";


// Protected route component - requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

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
      case '/profile':
        return <Profile />;
      default:
        return <AllEntries onEntryClick={openEntryDetail} />;
    }
  };

  return (
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
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/test-minimal" component={() => <div>Basic Test</div>} />
      <Route path="/" component={HomePage} />
      <Route path="/preview" component={PreviewPage} />
      <Route path="/social" component={SocialFeedPage} />
      <Route path="/myneura" component={MyNeuraPage} />
      <Route path="/mydotspark" component={MyDotSparkPage} />
      <Route path="/cognitive-identity" component={CognitiveIdentityPage} />
      <Route path="/join-circle" component={JoinCircleInvitePage} />
      <Route path="/thinq-circle/:circleId" component={ThinQCirclePage} />
      <Route path="/learning-engine" component={LearningEnginePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/notifications" component={NotificationsPage} />
      
      {/* All routes now public - no authentication required */}
      <Route path="/entries" component={AppWithLayout} />
      <Route path="/insights" component={AppWithLayout} />
      <Route path="/favorites" component={AppWithLayout} />
      <Route path="/network" component={AppWithLayout} />
      <Route path="/settings" component={AppWithLayout} />
      <Route path="/profile" component={Profile} />
      <Route path="/user/:userId" component={PublicProfile} />
      <Route path="/social" component={Social} />
      <Route path="/sparktest" component={SparkTest} />
      <Route path="/spark" component={Spark} />
      <Route path="/production-test" component={ProductionTest} />
      <Route path="/vector-migration-test" component={VectorMigrationTest} />
      <Route path="/auth-test" component={AuthTest} />
      <Route path="/simple-auth-test" component={SimpleAuthTest} />
      <Route path="/auth-verification-test" component={AuthVerificationTest} />
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
      <Route path="/dotspark-tuning/cognitive" component={CognitiveIdentityConfig} />
      <Route path="/dotspark-tuning/learning" component={NeuraTuningLearning} />  
      <Route path="/dotspark-tuning/expertise" component={NeuraTuningExpertise} />
      {/* Legacy Neura routes for backwards compatibility */}
      <Route path="/neura-tuning/core" component={NeuraTuningCore} />
      <Route path="/neura-tuning/cognitive" component={CognitiveIdentityConfig} />
      <Route path="/neura-tuning/learning" component={NeuraTuningLearning} />  
      <Route path="/neura-tuning/expertise" component={NeuraTuningExpertise} />
      <Route path="/neura-tuning-cognitive" component={CognitiveIdentityConfig} />
      <Route path="/cognitive-identity-config" component={CognitiveIdentityConfig} />

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
      <Route path="/intelligence-test" component={() => <div className="min-h-screen bg-gray-50 py-8"><IntelligenceClassification /></div>} />
      <Route path="/auth-test" component={AuthTest} />
      <Route path="/simple-debug" component={() => <div className="p-8"><h1>Debug Route Test</h1><p>If you can see this, routing is working!</p></div>} />
      <Route path="/quick-auth" component={QuickAuthTest} />
      <Route path="/simple-auth" component={SimpleAuthTest} />
      <Route path="/working-dot" component={WorkingDot} />
      <Route path="/working-dot-test" component={WorkingDotTest} />
      <Route path="/test-complete" component={TestComplete} />
      <Route path="/auth-mode" component={() => (
        <div className="p-8 text-center">
          <h1 className="text-2xl mb-4">Authentication</h1>
          <p>Demo mode has been removed. Please use Google authentication.</p>
          <a href="/home" className="text-blue-600 underline">Go to Home</a>
        </div>
      )} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/enhanced-chat" component={() => <div className="h-screen"><EnhancedChatInterface /></div>} />
      <Route path="/vector-chat" component={() => <div className="min-h-screen bg-gray-50"><IntelligentVectorChat /></div>} />
      <Route path="/cognitive-analysis" component={() => <CognitiveAnalysisInterface />} />
      <Route path="/intelligent-chat" component={() => <IntelligentConversationalChat />} />
      <Route path="/advanced-chat" component={() => <div className="min-h-screen bg-gray-50 p-4"><AdvancedDotSparkChat /></div>} />
      <Route path="/intelligence" component={IntelligenceSelector} />
      <Route path="/indexing-demo" component={IndexingDemo} />
      <Route path="/activation" component={ActivationPage} />
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
      setIsDotSparkActive(isActive);
    };
    
    checkActivation();
    
    // Check periodically to ensure we catch activation changes (reduced frequency)
    const interval = setInterval(checkActivation, 5000);
    
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
        <AuthInitializer>
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
          {/* iOS PWA Install Prompt */}
          <IosPwaInstallPrompt />
          {/* PWA Install Floating Button (only visible when installable) */}
          <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50">
            <PWAInstallButton size="lg" className="w-full md:w-auto" />
          </div>
        </AuthInitializer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;