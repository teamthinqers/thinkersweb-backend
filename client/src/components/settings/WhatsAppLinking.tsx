import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Smartphone, Check, Copy, RefreshCw } from "lucide-react";

export function WhatsAppLinking() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate a new link code
  const generateLinkCode = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("POST", "/api/whatsapp/generate-link-code");
      
      if (!response.ok) {
        throw new Error("Failed to generate link code");
      }
      
      const data = await response.json();
      setLinkCode(data.linkCode);
      setExpiryTime(new Date(data.expiresAt));
      
      toast({
        title: "Link code generated",
        description: "Send this code to the DotSpark WhatsApp number to link your account",
      });
    } catch (error) {
      console.error("Error generating link code:", error);
      toast({
        variant: "destructive",
        title: "Unable to generate link code",
        description: "Please try again later",
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

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Link WhatsApp with DotSpark
        </CardTitle>
        <CardDescription>
          Connect your WhatsApp to access your neural extension through the DotSpark dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">How to link your WhatsApp</h4>
            <ol className="text-sm space-y-2 list-decimal pl-4 text-amber-700 dark:text-amber-400">
              <li>Generate a link code using the button below</li>
              <li>Send the code to WhatsApp number <span className="font-mono">+16067157733</span></li>
              <li>Your WhatsApp will be linked to this DotSpark account</li>
              <li>All your WhatsApp conversations will now appear in your dashboard</li>
            </ol>
          </div>
          
          {linkCode && !isExpired() && (
            <div className="my-6">
              <div className="flex items-center justify-center">
                <div className="bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-700 rounded-md p-6 text-center w-full">
                  <h3 className="text-xl font-bold tracking-wider font-mono text-indigo-600 dark:text-indigo-400">
                    {linkCode}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {getRemainingTime()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyLinkCode}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {linkCode && isExpired() && (
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-900 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">
                This link code has expired. Please generate a new one.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={generateLinkCode} 
          disabled={loading}
          className="w-full"
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
      </CardFooter>
    </Card>
  );
}