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
      className="bg-gradient-to-r from-[#25D366] to-[#075E54] hover:from-[#128C7E] hover:to-[#063E38] flex items-center gap-2 shadow-lg text-white font-medium relative overflow-hidden group"
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
          {/* WhatsApp icon */}
          <svg className="w-5 h-5 relative z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"></path>
          </svg>
          {/* Neural network icon */}
          <svg className="w-5 h-5 ml-1 relative z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="5" r="3"></circle>
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="18" r="3"></circle>
            <line x1="6" y1="8" x2="6" y2="15"></line>
            <line x1="18" y1="8" x2="18" y2="15"></line>
            <line x1="9" y1="5" x2="15" y2="5"></line>
            <line x1="9" y1="18" x2="15" y2="18"></line>
            <line x1="6" y1="5" x2="18" y2="18"></line>
          </svg>
          <span className="relative z-10">Activate Neural Extension</span>
        </>
      )}
    </Button>
  );
};

export default WhatsAppContactButton;