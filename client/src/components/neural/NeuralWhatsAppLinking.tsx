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
      
      // Get the user's email or fallback to user ID
      const userEmail = user?.email;
      
      if (!userEmail) {
        // No email available, provide alternative instructions
        toast({
          variant: "destructive",
          title: "Email not available",
          description: "Please log in with an account that has an email address to link WhatsApp.",
        });
        setLoading(false);
        return;
      }
      
      // Create a pre-filled message that includes both explicit linking command and email in parentheses
      const phoneNumber = "16067157733";
      const message = `link:${userEmail}`;
      
      // Show success toast with specific instructions
      toast({
        title: "Opening WhatsApp",
        description: `WhatsApp will open with your email. Just tap send to link your account!`,
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
      
      // Add logging for debugging
      console.log(`Attempted to open WhatsApp with email: ${userEmail}`);
      
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        variant: "destructive",
        title: "Unable to open WhatsApp",
        description: "Please manually send 'link:your-email@example.com' to +16067157733 in WhatsApp",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mb-4">
      <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/30 dark:to-blue-950/30 p-6 rounded-lg border-2 border-indigo-100 dark:border-indigo-900/30 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Mobile device illustration */}
          <div className="relative w-32 h-52 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border-4 border-slate-300 dark:border-slate-700 flex-shrink-0 mx-auto sm:mx-0">
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
            <div className="absolute inset-1 rounded-lg overflow-hidden flex flex-col">
              <div className="h-8 bg-[#128C7E] flex items-center px-2 text-xs text-white font-medium">
                DotSpark
              </div>
              <div className="flex-1 bg-[#E5DDD5] dark:bg-[#0D1418] p-2 flex flex-col justify-end">
                <div className="ml-1 max-w-[80%] bg-white dark:bg-slate-700 p-1.5 text-[7px] rounded-lg mb-1 shadow-sm">
                  Hi! I'm DotSpark's Neural Extension
                </div>
                <div className="mr-1 ml-auto max-w-[80%] bg-[#D9FDD3] dark:bg-[#005C4B] p-1.5 text-[7px] rounded-lg shadow-sm">
                  link:{user?.email ? user.email.substring(0, 8) + "..." : "youremail..."}
                </div>
              </div>
            </div>
            
            {/* Animated connection ring */}
            <div className="absolute -inset-1 border-2 border-primary/30 rounded-xl animate-ping opacity-30"></div>
          </div>
          
          {/* Instructions */}
          <div className="flex-1">
            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3 text-lg">Authenticate Neural Extension</h4>
            <ol className="text-sm space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full mr-2 font-medium text-xs">1</span>
                <span>Click the <span className="font-medium text-primary">Authenticate WhatsApp</span> button below</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full mr-2 font-medium text-xs">2</span>
                <span>WhatsApp will open with a pre-filled message containing your email</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full mr-2 font-medium text-xs">3</span>
                <span>Tap <span className="font-medium text-green-600 dark:text-green-400">Send</span> without editing to complete authentication</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      
      {linkSent && (
        <div className="mb-6 p-6 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-900/30 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Smartphone className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-green-700 dark:text-green-400 font-bold text-lg mb-2">
              WhatsApp Ready!
            </h3>
            <p className="text-green-600 dark:text-green-500 text-sm mb-4 max-w-md mx-auto">
              Your WhatsApp is ready to authenticate. Send the pre-filled message to complete the neural extension setup!
            </p>
            <div className="mt-4">
              <Button
                onClick={openWhatsAppLink}
                className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white w-full sm:w-auto px-8 py-2 flex items-center justify-center gap-2 shadow-md"
                size="lg"
              >
                <SendHorizonal className="h-4 w-4" />
                <span>Re-open WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {!linkSent && (
        <Button 
          onClick={openWhatsAppLink} 
          disabled={loading}
          className="w-full sm:w-auto mx-auto px-8 py-6 h-auto text-lg font-medium relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white shadow-lg"
          size="lg"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-600/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Opening WhatsApp...</span>
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-5 w-5" />
              <span>Authenticate WhatsApp</span>
              <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-indigo-600/20 to-primary/20 group-hover:opacity-100 opacity-0 transition-opacity"></div>
            </>
          )}
        </Button>
      )}
    </div>
  );
}