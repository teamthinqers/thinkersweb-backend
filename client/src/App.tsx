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
import AuthPage from "@/pages/auth-page";
import Settings from "@/pages/Settings";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import EntryDetail from "@/components/entries/EntryDetail";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Protected route component
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

function App() {
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
