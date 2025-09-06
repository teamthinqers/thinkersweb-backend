import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface CompactWhatsAppButtonProps {
  className?: string;
}

export function CompactWhatsAppButton({ className = "" }: CompactWhatsAppButtonProps) {
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useMobile();

  // Fetch WhatsApp contact info
  useEffect(() => {
    const fetchWhatsAppContact = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/whatsapp/contact');
        
        if (response.ok) {
          const data = await response.json();
          setWhatsAppNumber(data.phoneNumber);
        } else {
          console.error('Failed to fetch WhatsApp contact info');
          // Fallback to hardcoded number if API fails
          setWhatsAppNumber('16067157733');
        }
      } catch (error) {
        console.error('Error fetching WhatsApp contact:', error);
        // Fallback to hardcoded number if API fails
        setWhatsAppNumber('16067157733');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWhatsAppContact();
  }, []);

  const handleButtonClick = () => {
    if (!whatsAppNumber) return;
    
    // Include the default message
    const defaultMessage = encodeURIComponent("Hey DotSpark, I've got a few things on my mind — need your thoughts");
    
    // Try to open in mobile app first with the default message
    const mobileAppLink = `whatsapp://send?phone=${whatsAppNumber}&text=${defaultMessage}`;
    window.location.href = mobileAppLink;
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      const webFallbackUrl = `https://wa.me/${whatsAppNumber}?text=${defaultMessage}`;
      window.location.href = webFallbackUrl;
    }, 500);
  };

  return (
    <Button
      size="default"
      onClick={handleButtonClick}
      disabled={loading || !whatsAppNumber}
      className={`rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      <span>Ask DotSpark</span>
    </Button>
  );
}