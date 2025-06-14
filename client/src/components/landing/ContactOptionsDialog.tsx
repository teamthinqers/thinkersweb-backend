import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { isFirstChat, markFirstChatDone } from '@/lib/usageLimits';
import { pwaPermissionManager } from "@/lib/pwaPermissions";

interface ContactOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsAppNumber: string | null;
}

export function ContactOptionsDialog({ 
  open, 
  onOpenChange, 
  whatsAppNumber 
}: ContactOptionsDialogProps) {
  const [_, setLocation] = useLocation();

  const handleWhatsAppClick = async () => {
    if (!whatsAppNumber) return;
    
    // Request PWA permissions first to eliminate popup friction
    const permissionsGranted = await pwaPermissionManager.grantAllPermissions();
    if (!permissionsGranted) {
      console.log("PWA permissions not granted, proceeding anyway");
    }
    
    // Only include default message for first-time users
    const isFirstTime = isFirstChat();
    const defaultMessage = isFirstTime ? "Hey DotSpark, I've got a few things on my mind - need your assistance" : "";
    const encodedMessage = encodeURIComponent(defaultMessage);
    
    // Mark first chat as done if this is the first interaction
    if (isFirstTime) {
      markFirstChatDone();
    }
    
    // For mobile devices, try the app first then fallback to web
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // Try to use the direct app link first
      const whatsappUrl = `whatsapp://send?phone=${whatsAppNumber}&text=${encodedMessage}`;
      
      // Create and click an actual anchor element for better mobile compatibility
      const a = document.createElement('a');
      a.href = whatsappUrl;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // After a short delay, try the web version as fallback
      setTimeout(() => {
        window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');
      }, 1000);
    } else {
      // For desktop/laptop, use WhatsApp Web - works if user has WhatsApp Web session or app installed
      window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');
    }
    
    onOpenChange(false);
  };

  const handleDirectChatClick = () => {
    // Navigate to direct chat page
    setLocation("/chat");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Contact Method</DialogTitle>
          <DialogDescription>
            How would you like to connect with DotSpark?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <Button
            onClick={handleWhatsAppClick}
            disabled={!whatsAppNumber}
            className="flex flex-col items-center justify-center h-20 p-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white border-0"
          >
            <MessageSquare className="h-8 w-8 mb-2" />
            <span className="font-medium">WhatsApp</span>
          </Button>
          
          <Button 
            onClick={handleDirectChatClick}
            className="flex flex-col items-center justify-center h-20 p-4 bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white border-0"
          >
            <MessageCircle className="h-8 w-8 mb-2" />
            <span className="font-medium">Direct Chat</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}