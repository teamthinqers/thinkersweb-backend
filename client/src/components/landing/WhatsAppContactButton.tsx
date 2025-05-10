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
    // Try to open WhatsApp mobile app first
    const mobileAppLink = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    // Create an invisible anchor element
    const linkElement = document.createElement('a');
    linkElement.href = mobileAppLink;
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    
    // Try to open the mobile app
    linkElement.click();
    
    // Set a fallback timer in case the app doesn't open
    setTimeout(() => {
      // If app didn't open, use the web version
      const webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = webFallbackUrl;
    }, 500);
    
    // Clean up the element
    setTimeout(() => {
      document.body.removeChild(linkElement);
    }, 1000);
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