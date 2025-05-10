import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// This component creates a WhatsApp "Click to Chat" button that opens WhatsApp with your number
const WhatsAppContactButton: React.FC = () => {
  // Replace with your Twilio WhatsApp number (without any formatting)
  // Format should be: countryCode + number (no spaces, no special characters)
  // This uses environment variable if available, otherwise uses a placeholder
  const whatsappNumber = process.env.TWILIO_PHONE_NUMBER || "";
  
  // Format number for WhatsApp deep link
  const formattedNumber = whatsappNumber.replace(/\D/g, '');
  
  // Pre-filled message (optional)
  const message = "Hello! I'd like to learn more about DotSpark.";
  
  const handleWhatsAppClick = () => {
    // Create WhatsApp deep link
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
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