import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, PenSquare } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import ChatEntryForm from "@/components/chat/ChatEntryForm";

// Interface for props to allow parent component to pass openNewEntry function
interface DashboardHeaderProps {
  onNewEntry?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNewEntry }) => {
  const isMobile = useMobile();
  // Local state to control the entry form if no onNewEntry prop is provided
  const [showEntryForm, setShowEntryForm] = useState(false);

  // Handle opening the entry form
  const handleOpenEntryForm = () => {
    if (onNewEntry) {
      // Use parent component's handler if provided
      onNewEntry();
    } else {
      // Otherwise use local state
      setShowEntryForm(true);
    }
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Your personal learning journey at a glance</p>
      </div>
      
      {/* Chat button - changes appearance based on device type */}
      {isMobile ? (
        // Mobile view: WhatsApp-style button
        <Button
          onClick={handleOpenEntryForm}
          size="sm"
          className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white h-10 w-10 p-0 flex items-center justify-center shadow-md"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      ) : (
        // Web view: Violet-colored button with text
        <Button
          onClick={handleOpenEntryForm}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <PenSquare className="h-4 w-4 mr-1.5" />
          <span>New Entry</span>
        </Button>
      )}
      
      {/* Local entry form modal - only shown if no parent handler was provided */}
      {!onNewEntry && (
        <ChatEntryForm 
          isOpen={showEntryForm} 
          onClose={() => setShowEntryForm(false)} 
        />
      )}
    </div>
  );
};

export default DashboardHeader;
