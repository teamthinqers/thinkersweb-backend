import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Smartphone, MessageCircle, SendHorizonal } from "lucide-react";

export function NeuralWhatsAppLinking() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Direct WhatsApp linking without server interaction
  const openWhatsAppLink = async () => {
    try {
      setLoading(true);
      
      // Create a message with the user's email to identify them
      const userIdentifier = user?.email || "user"; // Fallback to "user" if email not available
      
      // Create a pre-filled message that includes user information for identification
      const phoneNumber = "16067157733";
      const message = `Hey DotSpark! I'd like to link my WhatsApp with my DotSpark account (${userIdentifier}) to access my neural dashboard.`;
      
      // Show success toast
      toast({
        title: "Opening WhatsApp",
        description: "WhatsApp will open with a pre-filled message. Just tap send!",
      });
      
      setLinkSent(true);
      
      // Try to open in mobile app first
      const mobileAppLink = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      window.location.href = mobileAppLink;
      
      // Fallback to web version after a short delay
      setTimeout(() => {
        const webFallbackUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.location.href = webFallbackUrl;
      }, 500);
      
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        variant: "destructive",
        title: "Unable to open WhatsApp",
        description: "Please try again or manually open WhatsApp and send a message to +16067157733",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800 mb-6">
        <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">How to link your WhatsApp to DotSpark</h4>
        <ol className="text-sm space-y-2 list-decimal pl-4 text-amber-700 dark:text-amber-400">
          <li>Click the "Link WhatsApp" button below</li>
          <li>WhatsApp will open automatically with a pre-filled message</li>
          <li>Just send the message to complete the linking process</li>
        </ol>
      </div>
      
      {linkSent && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-md">
          <h3 className="text-green-700 dark:text-green-400 font-medium text-center mb-2">
            WhatsApp Message Ready!
          </h3>
          <p className="text-green-600 dark:text-green-500 text-sm text-center mb-4">
            Send the pre-filled message in WhatsApp to link your account. Our system will recognize you and link your account automatically.
          </p>
          <div className="mt-3">
            <Button
              onClick={openWhatsAppLink}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full flex items-center justify-center gap-2"
            >
              <SendHorizonal className="h-4 w-4" />
              <span>Open WhatsApp Again</span>
            </Button>
          </div>
        </div>
      )}
      
      {!linkSent && (
        <Button 
          onClick={openWhatsAppLink} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening WhatsApp...
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              Link WhatsApp with One Click
            </>
          )}
        </Button>
      )}
    </div>
  );
}