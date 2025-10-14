import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  onNewEntry: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, onNewEntry }) => {
  const isMobile = useMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
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
          <div className={`${isMobile ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
