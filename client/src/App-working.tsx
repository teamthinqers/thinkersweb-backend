import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Insights from "@/pages/Insights";
import Network from "@/pages/Network";
import LandingPage from "@/pages/LandingPage";
import LogoPage from "@/pages/LogoPage";
import Settings from "@/pages/Settings";
import WhatsAppEntries from "@/pages/WhatsAppEntries";
import FixedEntries from "@/pages/FixedEntries";
import MyNeura from "@/pages/MyNeura";
import NeuraTuningCore from "@/pages/NeuraTuningCore";
import NeuraTuningCognitive from "@/pages/NeuraTuningCognitive";
import NeuraTuningExpertise from "@/pages/NeuraTuningExpertise";
import NeuraTuningLearning from "@/pages/NeuraTuningLearning";
import CognitiveShieldConfig from "@/pages/CognitiveShieldConfig";
import DotSparkTuningPage from "@/pages/DotSparkTuningPage";
import DotSparkCapacityPage from "@/pages/DotSparkCapacityPage";
import NeuralTuningPage from "@/pages/NeuralTuningPage";
import NeuralCapacityPage from "@/pages/NeuralCapacityPage";
import DotCapture from "@/pages/DotCapture";
import QuickCapture from "@/pages/QuickCapture";
import Testing from "@/pages/Testing";
import CogniShieldMonitor from "@/pages/CogniShieldMonitor";
import { neuraStorage } from "./lib/neuraStorage";

// Simplified floating dot component without authentication dependencies
const SimpleFloatingDot = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="relative">
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-75 animate-ping"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-50 animate-pulse"></div>
        
        {/* Main dot */}
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
      <Route path="/insights" component={Insights} />
      <Route path="/network" component={Network} />
      <Route path="/settings" component={Settings} />
      <Route path="/whatsapp-entries" component={WhatsAppEntries} />
      <Route path="/fixed-entries" component={FixedEntries} />
      <Route path="/neura-tuning-core" component={NeuraTuningCore} />
      <Route path="/neura-tuning-cognitive" component={NeuraTuningCognitive} />
      <Route path="/neura-tuning-expertise" component={NeuraTuningExpertise} />
      <Route path="/neura-tuning-learning" component={NeuraTuningLearning} />
      <Route path="/cognitive-shield-config" component={CognitiveShieldConfig} />
      <Route path="/dotspark-tuning" component={DotSparkTuningPage} />
      <Route path="/dotspark-capacity" component={DotSparkCapacityPage} />
      <Route path="/neural-tuning" component={NeuralTuningPage} />
      <Route path="/neural-capacity" component={NeuralCapacityPage} />
      <Route path="/dot" component={DotCapture} />
      <Route path="/quick-capture" component={QuickCapture} />
      <Route path="/testing" component={Testing} />
      <Route path="/cogni-shield-monitor" component={CogniShieldMonitor} />
      <Route path="/logo" component={LogoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [isDotSparkActive, setIsDotSparkActive] = useState(false);
  
  // Check DotSpark activation status
  useEffect(() => {
    const checkActivation = () => {
      const isActive = neuraStorage.isActivated();
      setIsDotSparkActive(isActive);
    };
    
    checkActivation();
    const interval = setInterval(checkActivation, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Network error handling
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message && (
          event.message.includes('Network') || 
          event.message.includes('network') ||
          event.message.includes('Can\'t find variable: Network')
        )) {
        setShowNetworkWarning(true);
        
        if (event.message.includes('Can\'t find variable: Network')) {
          event.preventDefault();
        }
      }
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {showNetworkWarning && (
        <div className="fixed top-0 left-0 right-0 p-2 bg-amber-500 text-black z-50 text-center text-sm">
          <p>
            Network module warning detected.
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
      <SimpleFloatingDot isActive={isDotSparkActive} />
    </QueryClientProvider>
  );
}

export default App;