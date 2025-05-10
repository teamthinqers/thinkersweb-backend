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
          // Fallback to an empty state if API fails
          setWhatsappNumber("");
          setDirectLink("");
        }
      } catch (error) {
        console.error("Error fetching WhatsApp number:", error);
        // Fallback to an empty state if API fails
        setWhatsappNumber("");
        setDirectLink("");
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
    let mobileAppLink;
    
    // Support both formats: api.whatsapp.com and wa.me
    if (finalUrl.includes('api.whatsapp.com/send')) {
      mobileAppLink = finalUrl.replace('https://api.whatsapp.com/send', 'whatsapp://send');
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
      className="bg-gradient-to-r from-violet-600 to-indigo-900 hover:from-violet-700 hover:to-indigo-950 flex items-center gap-1 px-2 py-1 h-8 shadow-md border border-violet-400/30 hover:scale-[1.05] transition-all duration-200"
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
          {/* Neural network icon - replacing WhatsApp icon for compact button */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="5" r="2"></circle>
            <circle cx="18" cy="5" r="2"></circle>
            <circle cx="6" cy="18" r="2"></circle>
            <circle cx="18" cy="18" r="2"></circle>
            <line x1="6" y1="7" x2="6" y2="16"></line>
            <line x1="18" y1="7" x2="18" y2="16"></line>
            <line x1="8" y1="5" x2="16" y2="5"></line>
            <line x1="8" y1="18" x2="16" y2="18"></line>
            <line x1="6" y1="5" x2="18" y2="18"></line>
          </svg>
          <span className="text-xs font-medium">Neural Link</span>
        </>
      )}
    </Button>
  );
};

export default CompactWhatsAppButton;