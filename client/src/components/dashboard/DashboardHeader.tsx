import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, PenSquare, MessageCircle } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import ChatEntryForm from "@/components/chat/ChatEntryForm";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { ContactOptionsDialog } from "@/components/landing/ContactOptionsDialog";
import { pwaPermissionManager } from "@/lib/pwaPermissions";

// Interface for props to allow parent component to pass openNewEntry function
interface DashboardHeaderProps {
  onNewEntry?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNewEntry }) => {
  const isMobile = useMobile();
  // Local state to control the entry form if no onNewEntry prop is provided
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>(null);
  
  // Fetch WhatsApp number
  useEffect(() => {
    fetch('/api/whatsapp/contact')
      .then(res => res.json())
      .then(data => {
        setWhatsAppNumber(data.phoneNumber);
      })
      .catch(err => {
        console.error("Error fetching WhatsApp contact:", err);
        // Fallback to hardcoded number if API fails
        setWhatsAppNumber('16067157733');
      });
  }, []);
  
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
  
  // Handle chat button click - opens contact options dialog
  const handleChatClick = async () => {
    // Request PWA permissions first to eliminate popup friction
    const permissionsGranted = await pwaPermissionManager.grantAllPermissions();
    if (!permissionsGranted) {
      console.log("PWA permissions not granted, proceeding anyway");
    }
    
    setContactDialogOpen(true);
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Your personal learning journey at a glance</p>
      </div>
      
      {/* Chat button - opens contact options dialog for all users */}
      <div className="flex items-center">
        <Button
          onClick={handleChatClick}
          size="sm"
          className="bg-amber-700 hover:bg-amber-800 text-white shadow-md flex items-center"
        >
          <MessageCircle className="h-4 w-4 mr-1.5" />
          <span>Chat with DotSpark</span>
        </Button>
      </div>
      
      {/* Contact Options Dialog */}
      <ContactOptionsDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        whatsAppNumber={whatsAppNumber}
      />
      
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
