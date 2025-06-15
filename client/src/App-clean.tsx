import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import MyNeura from "@/pages/MyNeura";
import DotCapture from "@/pages/DotCapture";
import { neuraStorage } from "./lib/neuraStorage";

// Simple floating dot without authentication dependencies
const FloatingDot = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-75 animate-ping"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-50 animate-pulse"></div>
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200">
          <div className="absolute inset-2 rounded-full bg-white"></div>
        </div>
      </div>
    </div>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/my-neura" component={MyNeura} />
      <Route path="/dot" component={DotCapture} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isDotSparkActive, setIsDotSparkActive] = useState(false);
  
  useEffect(() => {
    const checkActivation = () => {
      const isActive = neuraStorage.isActivated();
      setIsDotSparkActive(isActive);
    };
    
    checkActivation();
    const interval = setInterval(checkActivation, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <FloatingDot isActive={isDotSparkActive} />
    </QueryClientProvider>
  );
}

export default App;