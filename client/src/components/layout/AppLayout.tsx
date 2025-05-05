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
      {/* Mobile menu button */}
      {isMobile && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={!isMobile || showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)}
        isMobile={isMobile}
        onNewEntry={onNewEntry}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onSearch={() => {}} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
