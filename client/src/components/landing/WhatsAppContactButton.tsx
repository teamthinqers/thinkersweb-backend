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

  const getWhatsAppLink = () => {
    if (!whatsAppNumber) return '#';
    
    const defaultMessage = "Hey DotSpark, I've got a few things on my mind — need your thoughts";
    const encodedMessage = encodeURIComponent(defaultMessage);
    return `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
  };

  const buttonClasses = `
    ${className}
    ${variant === 'default' ? 'bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent' : ''}
    ${variant === 'outline' ? 'bg-transparent border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10' : ''}
    ${variant === 'subtle' ? 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-transparent' : ''}
    ${variant === 'ghost' ? 'bg-transparent text-[#25D366] hover:bg-[#25D366]/10 border-transparent' : ''}
  `;

  if (loading || !whatsAppNumber) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled={true}
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

  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${buttonClasses} ${
        size === 'default' ? 'h-10 px-4 py-2' :
        size === 'sm' ? 'h-9 rounded-md px-3' :
        size === 'lg' ? 'h-11 rounded-md px-8' :
        size === 'icon' ? 'h-10 w-10' : 'h-10 px-4 py-2'
      }`}
    >
      {showIcon && <MessageSquare className="h-4 w-4 mr-2" />}
      {label}
    </a>
  );
}