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
  
  // Get WhatsApp number and direct link for direct linking
  const [phoneNumber, setPhoneNumber] = useState('');
  const [directLink, setDirectLink] = useState('');
  
  // Fetch the Twilio WhatsApp number and direct link from our API
  useEffect(() => {
    // This endpoint doesn't require authentication, so we can call it directly
    fetch('/api/whatsapp/contact')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.phoneNumber) {
            // Format the phone number to ensure it works with WhatsApp
            // Strip any + sign since the wa.me link doesn't need it
            const formattedNumber = data.phoneNumber.replace(/^\+/, '');
            setPhoneNumber(formattedNumber);
            console.log("Got WhatsApp number:", formattedNumber);
          }
          
          if (data.directLink) {
            setDirectLink(data.directLink);
            console.log("Got WhatsApp direct link:", data.directLink);
          }
        }
      })
      .catch(err => console.error("Error fetching WhatsApp contact:", err));
  }, []);
  
  // Direct WhatsApp link with default message
  const defaultMessage = encodeURIComponent("Hey DotSpark, I've got a few things on my mind — need your thoughts");
  const whatsappLink = directLink || `https://wa.me/${phoneNumber || '16067157733'}?text=${defaultMessage}`;
  
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
