import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// This component creates a neural extension WhatsApp button that matches the main section
const WhatsAppContactButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Pre-filled message (optional)
  const message = "Hello! I'd like to connect my neural extension via WhatsApp.";
  
  // Fetch the WhatsApp number from the backend
  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/whatsapp/contact");
        const data = await response.json();
        
        if (data.phoneNumber) {
          setWhatsappNumber(data.phoneNumber);
        } else {
          console.error("No WhatsApp number returned from API");
          // Fallback to Twilio demo number if API fails
          setWhatsappNumber("14155238886");
        }
      } catch (error) {
        console.error("Error fetching WhatsApp number:", error);
        // Fallback to Twilio demo number if API fails
        setWhatsappNumber("14155238886");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWhatsAppNumber();
  }, []);
  
  const handleWhatsAppClick = () => {
    // Check if we have a WhatsApp number
    if (!whatsappNumber) {
      console.error("No WhatsApp number available");
      return;
    }
    
    // Create both native app and web URIs
    const mobileAppLink = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    const webFallbackUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    // Try to open the mobile app first using an invisible anchor
    const linkElement = document.createElement('a');
    linkElement.href = mobileAppLink;
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    
    // Try to open the mobile app
    linkElement.click();
    
    // Set a fallback timer in case the app doesn't open
    setTimeout(() => {
      // If app didn't open, use the web version
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
      className="bg-[#25D366] hover:bg-[#128C7E] flex items-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
          </svg>
          <span>Connect via WhatsApp</span>
        </>
      )}
    </Button>
  );
};

export default WhatsAppContactButton;