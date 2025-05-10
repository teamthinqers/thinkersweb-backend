import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Smartphone, Check, Copy, RefreshCw, SendHorizonal } from "lucide-react";

export function NeuralWhatsAppLinking() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Generate a new link code
  const generateLinkCode = async () => {
    try {
      setLoading(true);
      console.log("Attempting to generate WhatsApp link code...");
      
      const response = await apiRequest("POST", "/api/whatsapp/generate-link-code");
      console.log("Link code API response status:", response.status);
      
      // Get the response text for debugging
      const responseText = await response.text();
      
      if (response.status === 401) {
        setAuthError(true);
        throw new Error("You need to be logged in to generate a link code. Please log in to your DotSpark account first.");
      } else if (!response.ok) {
        throw new Error(`Failed to generate link code: ${response.status} ${responseText}`);
      }
      
      // Parse the JSON after getting the text
      const data = JSON.parse(responseText);
      
      if (!data.linkCode || !data.expiresAt) {
        throw new Error("Invalid response format from server");
      }
      
      setLinkCode(data.linkCode);
      setExpiryTime(new Date(data.expiresAt));
      
      toast({
        title: "Link code generated",
        description: "Send this code to the DotSpark WhatsApp number",
      });
    } catch (error) {
      console.error("Error generating link code:", error);
      toast({
        variant: "destructive",
        title: "Unable to generate link code",
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy the link code to clipboard
  const copyLinkCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "Send this code to the DotSpark WhatsApp number",
      });
    }
  };

  // Format remaining time
  const getRemainingTime = () => {
    if (!expiryTime) return "";
    
    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `Expires in ${minutes}m ${seconds}s`;
  };

  // Check if the code is expired
  const isExpired = () => {
    if (!expiryTime) return false;
    return new Date() > expiryTime;
  };

  // Open WhatsApp with the code
  const openWhatsAppWithCode = () => {
    if (!linkCode) return;
    
    const phoneNumber = "16067157733";
    const message = `whatsapp:${linkCode}`;
    
    // Try to open in mobile app first
    const mobileAppLink = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.location.href = mobileAppLink;
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      const webFallbackUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = webFallbackUrl;
    }, 500);
  };

  return (
    <div className="mb-6">
      <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800 mb-6">
        <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">How to link your WhatsApp to DotSpark</h4>
        <ol className="text-sm space-y-2 list-decimal pl-4 text-amber-700 dark:text-amber-400">
          <li>Generate a link code using the button below</li>
          <li>Send the code to WhatsApp number <span className="font-mono">+16067157733</span></li>
          <li>Your WhatsApp will be linked to this DotSpark account</li>
          <li>All your WhatsApp conversations will now appear in your dashboard</li>
        </ol>
      </div>
      
      {authError && (
        <div className="my-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-center">
          <h3 className="text-amber-800 dark:text-amber-400 font-medium mb-2">Authentication Required</h3>
          <p className="text-amber-700 dark:text-amber-500 text-sm mb-3">
            You need to be logged in to generate a WhatsApp link code.
          </p>
        </div>
      )}
      
      {linkCode && !isExpired() && (
        <div className="mb-6">
          <div className="relative p-6 border-2 border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 text-center">
            <div className="absolute top-0 right-0 m-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyLinkCode}
                className="h-7 w-7"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <h3 className="text-xl font-bold tracking-wider font-mono text-primary dark:text-primary/90 mb-1">
              {linkCode}
            </h3>
            <p className="text-xs text-muted-foreground">
              {getRemainingTime()}
            </p>
            
            <div className="mt-4">
              <Button 
                onClick={openWhatsAppWithCode}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full flex items-center justify-center gap-2"
              >
                <SendHorizonal className="h-4 w-4" />
                <span>Open WhatsApp & Send Code</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {linkCode && isExpired() && (
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-900 text-center mb-6">
          <p className="text-red-600 dark:text-red-400 font-medium">
            This link code has expired. Please generate a new one.
          </p>
        </div>
      )}
      
      <Button 
        onClick={generateLinkCode} 
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating code...
          </>
        ) : linkCode && !isExpired() ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Code
          </>
        ) : (
          <>
            <Smartphone className="mr-2 h-4 w-4" />
            Generate WhatsApp Link Code
          </>
        )}
      </Button>
    </div>
  );
}