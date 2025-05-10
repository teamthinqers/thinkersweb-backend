import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// This component creates a compact WhatsApp button for the header
const CompactWhatsAppButton: React.FC = () => {
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
    
    // Format the URL differently for Meta Business API vs regular phone numbers
    let webFallbackUrl = '';
    
    // Check if the number is a Meta Business API ID (long numeric ID)
    if (whatsappNumber.length > 15) {
      // Meta Business API format for Direct Link
      webFallbackUrl = `https://api.whatsapp.com/send?phone=15557649526`;
    } else {
      // Regular phone number format
      // Try to open WhatsApp mobile app first
      const mobileAppLink = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
      
      // Create an invisible anchor element
      const linkElement = document.createElement('a');
      linkElement.href = mobileAppLink;
      linkElement.style.display = 'none';
      document.body.appendChild(linkElement);
      
      // Try to open the mobile app
      linkElement.click();
      
      // Standard wa.me link as fallback
      webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Clean up the element
      setTimeout(() => {
        document.body.removeChild(linkElement);
      }, 1000);
    }
    
    // Set a fallback timer in case the app doesn't open
    setTimeout(() => {
      // If app didn't open, use the web version
      window.location.href = webFallbackUrl;
    }, 500);
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="bg-[#25D366] hover:bg-[#128C7E] flex items-center gap-1 px-2 py-1 h-8"
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
          </svg>
          <span className="text-xs font-medium">Connect</span>
        </>
      )}
    </Button>
  );
};

export default CompactWhatsAppButton;