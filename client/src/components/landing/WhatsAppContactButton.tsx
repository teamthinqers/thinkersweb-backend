import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// This component creates a neural extension WhatsApp button that matches the main section
const WhatsAppContactButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(""); 
  const [directLink, setDirectLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Pre-filled message (optional)
  const message = "Hello! I'd like to activate my neural extension.";
  
  // Hardcode the WhatsApp number to ensure consistency
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Use your Twilio WhatsApp number directly
      const phoneNumber = "16067157733";
      setWhatsappNumber(phoneNumber);
      
      // Create a direct WhatsApp link that bypasses Twilio's formatting requirements
      // This will open WhatsApp directly with your number
      setDirectLink(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
      
      console.log("Using direct WhatsApp link:", `https://wa.me/${phoneNumber}`);
    } catch (error) {
      console.error("Error setting up WhatsApp link:", error);
    } finally {
      setIsLoading(false);
    }
  }, [message]);
  
  const handleWhatsAppClick = () => {
    // Check if we have a WhatsApp direct link
    if (!directLink) {
      console.error("No WhatsApp direct link available");
      return;
    }
    
    // Add the message parameter to the URL if it's not already there
    const finalUrl = directLink.includes('?') 
      ? `${directLink}&text=${encodeURIComponent(message)}`
      : `${directLink}?text=${encodeURIComponent(message)}`;
    
    // Try to open WhatsApp mobile app first
    let mobileAppLink;
    
    // Support all WhatsApp formats including WhatsApp Business Platform
    if (finalUrl.includes('api.whatsapp.com/send')) {
      mobileAppLink = finalUrl.replace('https://api.whatsapp.com/send', 'whatsapp://send');
    } else if (finalUrl.includes('api.whatsapp.com/message/WABA_ID')) {
      // Business Platform ID format - use direct WhatsApp URI
      mobileAppLink = finalUrl;
    } else if (finalUrl.includes('wa.me/business/')) {
      // Business Platform ID format - keep as is, will open in WhatsApp app
      mobileAppLink = finalUrl;
    } else if (finalUrl.includes('wa.me/')) {
      mobileAppLink = finalUrl.replace('https://wa.me/', 'whatsapp://send?phone=');
    } else {
      mobileAppLink = finalUrl; // Use as-is if format not recognized
    }
    
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
      window.location.href = finalUrl;
    }, 500);
    
    // Clean up the element
    setTimeout(() => {
      document.body.removeChild(linkElement);
    }, 1000);
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="bg-[#25D366] hover:bg-[#1FAF55] flex items-center gap-3 shadow-lg text-white font-medium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 rounded-md border border-green-400/30 py-3 px-4 w-full"
      disabled={isLoading}
    >
      {/* Neural network background effect */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <svg className="absolute w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="2" fill="white" className="animate-pulse">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="20" r="2" fill="white" className="animate-pulse">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="80" r="2" fill="white" className="animate-pulse">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="80" r="2" fill="white" className="animate-pulse">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <line x1="20" y1="20" x2="80" y2="80" stroke="white" strokeWidth="0.5">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="20" y1="80" x2="80" y2="20" stroke="white" strokeWidth="0.5">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="20" y1="20" x2="20" y2="80" stroke="white" strokeWidth="0.5">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="80" y1="20" x2="80" y2="80" stroke="white" strokeWidth="0.5">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.2s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>
      
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {/* Official WhatsApp logo */}
          <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="relative z-10 text-lg font-semibold">Connect on WhatsApp</span>
        </>
      )}
    </Button>
  );
};

export default WhatsAppContactButton;