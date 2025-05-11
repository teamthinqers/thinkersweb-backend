import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, PenSquare, MessageCircle } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";

// Interface for props to allow parent component to pass openNewEntry function
interface DashboardHeaderProps {
  onNewEntry?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNewEntry }) => {
  const isMobile = useMobile();
  // Local state to control the entry form if no onNewEntry prop is provided
  const [showEntryForm, setShowEntryForm] = useState(false);
  // Get WhatsApp phone number
  const { phoneNumber } = useWhatsAppStatus();
  
  // Direct WhatsApp link for mobile
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  
  // Handle opening the entry form on web
  const handleOpenEntryForm = () => {
    if (onNewEntry) {
      // Use parent component's handler if provided
      onNewEntry();
    } else {
      // Otherwise use local state
      setShowEntryForm(true);
    }
  };
  
  // Handle WhatsApp link on mobile
  const handleMobileClick = () => {
    // On mobile, we direct users to WhatsApp
    if (isMobile) {
      window.open(whatsappLink, '_blank');
    } else {
      // On desktop, we still use the entry form
      handleOpenEntryForm();
    }
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Your personal learning journey at a glance</p>
      </div>
      
      {/* Chat button - changes appearance and behavior based on device type */}
      <div className="flex items-center">
        {isMobile ? (
          // Mobile view: WhatsApp-style button that opens WhatsApp directly
          <Button
            onClick={handleMobileClick}
            size="sm"
            className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white h-11 w-11 p-0 flex items-center justify-center shadow-md ml-auto"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        ) : (
          // Web view: Violet-colored message button for entries
          <Button
            onClick={handleOpenEntryForm}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-md flex items-center"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            <span>Chat Entry</span>
          </Button>
        )}
      </div>
      
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
