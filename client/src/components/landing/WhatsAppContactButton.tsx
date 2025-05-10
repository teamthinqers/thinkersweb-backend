import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// This component creates a WhatsApp "Click to Chat" button that opens WhatsApp with your number
const WhatsAppContactButton: React.FC = () => {
  // Hardcode your Twilio WhatsApp number here (without any formatting)
  // Format should be: countryCode + number (no spaces, no special characters)
  // IMPORTANT: For production, you should replace this with your actual WhatsApp number
  const whatsappNumber = "14155238886"; // Example: This is a Twilio demo number
  
  // Pre-filled message (optional)
  const message = "Hello! I'd like to learn more about DotSpark.";
  
  const handleWhatsAppClick = () => {
    // Create WhatsApp deep link
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
    >
      <MessageCircle className="h-5 w-5" />
      <span>Chat on WhatsApp</span>
    </Button>
  );
};

export default WhatsAppContactButton;