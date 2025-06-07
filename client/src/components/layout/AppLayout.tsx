import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useMobile } from "@/hooks/use-mobile";
import { Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promptInstall } from "@/lib/pwaUtils";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  children: React.ReactNode;
  onNewEntry: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, onNewEntry }) => {
  const isMobile = useMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Setup event listener for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      (window as any).deferredPrompt = e;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Hide install button if app is already installed
    if (isStandalone) {
      setShowInstallButton(false);
    }
    
    // Check for the deferredPrompt that might have fired before component mounted
    if ((window as any).deferredPrompt) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleInstallClick = () => {
    promptInstall();
    // After installation attempt, hide the button
    setShowInstallButton(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={!isMobile || showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)}
        isMobile={isMobile}
        onNewEntry={onNewEntry}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onSearch={() => {}} 
          onMenuClick={toggleMobileSidebar}
          showMenuButton={isMobile}
        />
        <main className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'pt-2 px-2' : 'p-4'} bg-gray-50 dark:bg-gray-900 relative`}>
          {/* PWA Install Button */}
          {showInstallButton && (
            <div className="fixed bottom-4 right-4 z-50" id="pwa-install-button">
              <Button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800"
              >
                <Download size={18} />
                <span>Install App</span>
                <Badge variant="outline" className="ml-1 bg-purple-600 text-white border-purple-500">
                  New
                </Badge>
              </Button>
            </div>
          )}
          
          <div className={`${isMobile ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
