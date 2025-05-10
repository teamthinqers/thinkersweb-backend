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
    
    // Support all WhatsApp formats including WhatsApp Business Platform
    if (finalUrl.includes('api.whatsapp.com/send')) {
      mobileAppLink = finalUrl.replace('https://api.whatsapp.com/send', 'whatsapp://send');
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
      className="bg-green-600 hover:bg-green-700 flex items-center gap-1 px-2 py-1 h-8 shadow-md hover:scale-[1.05] transition-all duration-200 rounded-md"
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
          {/* WhatsApp icon for the compact button */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-xs font-medium">Connect</span>
        </>
      )}
    </Button>
  );
};

export default CompactWhatsAppButton;