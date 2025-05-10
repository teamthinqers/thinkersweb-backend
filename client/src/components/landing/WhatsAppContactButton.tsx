import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, MessageSquare, Loader2 } from "lucide-react";

interface WhatsAppContactButtonProps {
  variant?: 'default' | 'outline' | 'subtle' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function WhatsAppContactButton({ 
  variant = 'default', 
  size = 'default', 
  className = "",
  showIcon = true,
  label = "Ask DotSpark"
}: WhatsAppContactButtonProps) {
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>(null);
  const [whatsAppLink, setWhatsAppLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch WhatsApp contact info
  useEffect(() => {
    const fetchWhatsAppContact = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/whatsapp/contact');
        
        if (response.ok) {
          const data = await response.json();
          setWhatsAppNumber(data.phoneNumber);
          setWhatsAppLink(data.directLink);
          console.log('Using direct WhatsApp link:', data.directLink);
        } else {
          console.error('Failed to fetch WhatsApp contact info');
          // Fallback to hardcoded number if API fails
          setWhatsAppNumber('16067157733');
          setWhatsAppLink('https://wa.me/16067157733');
        }
      } catch (error) {
        console.error('Error fetching WhatsApp contact:', error);
        // Fallback to hardcoded number if API fails
        setWhatsAppNumber('16067157733');
        setWhatsAppLink('https://wa.me/16067157733');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWhatsAppContact();
  }, []);

  const handleButtonClick = () => {
    if (!whatsAppNumber) return;
    
    // Try to open in mobile app first
    const mobileAppLink = `whatsapp://send?phone=${whatsAppNumber}`;
    window.location.href = mobileAppLink;
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      const webFallbackUrl = whatsAppLink || `https://wa.me/${whatsAppNumber}`;
      window.location.href = webFallbackUrl;
    }, 500);
  };

  const buttonClasses = `
    ${className}
    ${variant === 'default' ? 'bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent' : ''}
    ${variant === 'outline' ? 'bg-transparent border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10' : ''}
    ${variant === 'subtle' ? 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-transparent' : ''}
    ${variant === 'ghost' ? 'bg-transparent text-[#25D366] hover:bg-[#25D366]/10 border-transparent' : ''}
  `;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleButtonClick}
      disabled={loading || !whatsAppNumber}
      className={buttonClasses}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        showIcon && <MessageSquare className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  );
}