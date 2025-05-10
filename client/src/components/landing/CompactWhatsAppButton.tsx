import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// This component creates a compact WhatsApp button for the header
const CompactWhatsAppButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(""); 
  const [directLink, setDirectLink] = useState<string>("");
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
          
          // Use the direct link from the API if available
          if (data.directLink) {
            setDirectLink(data.directLink);
          } else {
            // Fallback - generate the link ourselves
            setDirectLink(`https://api.whatsapp.com/send?phone=${data.phoneNumber}`);
          }
        } else {
          console.error("No WhatsApp number returned from API");
          // Fallback to a default number if API fails
          setWhatsappNumber("15557649526");
          setDirectLink("https://api.whatsapp.com/send?phone=15557649526");
        }
      } catch (error) {
        console.error("Error fetching WhatsApp number:", error);
        // Fallback to a default number if API fails
        setWhatsappNumber("15557649526");
        setDirectLink("https://api.whatsapp.com/send?phone=15557649526");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWhatsAppNumber();
  }, []);
  
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
    const mobileAppLink = finalUrl.replace('https://api.whatsapp.com/send', 'whatsapp://send');
    
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