import React from 'react';
import { Button } from "@/components/ui/button";

// This component creates a neural extension WhatsApp button that matches the main section
const WhatsAppContactButton: React.FC = () => {
  // Hardcode your Twilio WhatsApp number here (without any formatting)
  // Format should be: countryCode + number (no spaces, no special characters)
  // IMPORTANT: For production, you should replace this with your actual WhatsApp number
  const whatsappNumber = "14155238886"; // Example: This is a Twilio demo number
  
  // Pre-filled message (optional)
  const message = "Hello! I'd like to connect my neural extension via WhatsApp.";
  
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
      className="bg-[#128C7E] hover:bg-[#075E54] flex items-center gap-2"
    >
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
      </svg>
      <span>Connect Neural Extension</span>
    </Button>
  );
};

export default WhatsAppContactButton;