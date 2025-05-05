import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Check, X, ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WhatsAppIntegration() {
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [registered, setRegistered] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const { toast } = useToast();

  // Fetch WhatsApp registration status
  useEffect(() => {
    async function getWhatsAppStatus() {
      try {
        setLoading(true);
        const res = await apiRequest("GET", "/api/whatsapp/status");
        const data = await res.json();
        
        setRegistered(data.registered);
        setPendingVerification(!!data.pendingVerification);
        
        if (data.registered && data.phoneNumber) {
          setCurrentPhone(data.phoneNumber);
        }
        
        if (data.pendingVerification && data.phoneNumber) {
          setPendingPhoneNumber(data.phoneNumber);
        }
      } catch (error) {
        console.error("Error fetching WhatsApp status:", error);
        toast({
          title: "Error",
          description: "Could not fetch WhatsApp chatbot status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getWhatsAppStatus();
  }, [toast]);

  // Request OTP for phone number verification
  const handleRequestOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setRequestingOtp(true);
      const res = await apiRequest("POST", "/api/whatsapp/request-otp", { phoneNumber });
      const data = await res.json();
      
      if (res.ok) {
        setPendingVerification(true);
        setPendingPhoneNumber(phoneNumber);
        setPhoneNumber("");
        
        if (data.otpCode) {
          // In development mode, the OTP code is included in the response
          // We'll populate the OTP field automatically and show a toast with the code
          setOtpCode(data.otpCode);
          toast({
            title: "Development Mode - OTP Auto-filled",
            description: `Verification code: ${data.otpCode}`,
          });
        } else {
          toast({
            title: "Verification Code Sent",
            description: data.message || "Please check your WhatsApp for the verification code",
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setRequestingOtp(false);
    }
  };

  // Verify OTP and register phone number
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await apiRequest("POST", "/api/whatsapp/verify-otp", { otpCode });
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Success",
          description: data.message || "WhatsApp number verified successfully",
        });
        setRegistered(true);
        setCurrentPhone(pendingPhoneNumber);
        setPendingVerification(false);
        setPendingPhoneNumber("");
        setOtpCode("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to verify WhatsApp number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify WhatsApp number",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Legacy direct registration without OTP (will be removed)
  const handleRegister = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegistering(true);
      const res = await apiRequest("POST", "/api/whatsapp/register", { phoneNumber });
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Success",
          description: data.message || "DotSpark WhatsApp chatbot activated successfully",
        });
        setRegistered(true);
        setCurrentPhone(phoneNumber);
        setPhoneNumber("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to activate WhatsApp chatbot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error activating WhatsApp chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to activate WhatsApp chatbot",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  // Unregister a phone number
  const handleUnregister = async () => {
    try {
      setUnregistering(true);
      const res = await apiRequest("POST", "/api/whatsapp/unregister");
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Success",
          description: data.message || "DotSpark WhatsApp chatbot deactivated successfully",
        });
        setRegistered(false);
        setCurrentPhone("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to deactivate WhatsApp chatbot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deactivating WhatsApp chatbot:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate WhatsApp chatbot",
        variant: "destructive",
      });
    } finally {
      setUnregistering(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              DotSpark WhatsApp Chatbot
            </CardTitle>
            <CardDescription>
              Activate DotSpark's WhatsApp chatbot to add learning dots through conversation
            </CardDescription>
          </div>
          {registered && (
            <Badge className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700">
              <Check className="h-3 w-3 mr-1" /> Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : registered ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <p className="text-sm text-muted-foreground mb-2">Connected Phone:</p>
              <p className="font-medium">{currentPhone}</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-100 dark:border-amber-900 mb-4">
              <p className="font-medium mb-2 text-amber-800 dark:text-amber-400">Important: Twilio WhatsApp Sandbox Setup</p>
              <ol className="text-sm space-y-2 list-decimal pl-4 text-amber-700 dark:text-amber-400">
                <li>Save the Twilio WhatsApp number <span className="font-mono">+14155238886</span> to your contacts as "DotSpark Bot"</li>
                <li>Send the message <span className="font-mono">join example-sandbox</span> to this number on WhatsApp</li>
                <li>You'll receive a confirmation when connected to the Twilio Sandbox</li>
                <li>Now your WhatsApp is linked to the sandbox and can receive messages from our app</li>
              </ol>
              <p className="text-xs mt-2 text-amber-600 dark:text-amber-500">Note: In production, you would use an approved WhatsApp Business number instead of the Sandbox.</p>
            </div>

            <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
              <p className="font-medium mb-2">Chat with DotSpark AI on WhatsApp:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4">
                <li>Send a message to the DotSpark WhatsApp chatbot to create a learning dot</li>
                <li>Start your message with "Q:" to ask questions about your knowledge base</li>
                <li>Type "summary" to receive an AI-generated summary of recent entries</li>
                <li>Type "help" to see all available chatbot commands</li>
              </ol>
            </div>
          </div>
        ) : pendingVerification ? (
          <div className="space-y-4">
            <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                We've sent a verification code to your WhatsApp number: <span className="font-medium">{pendingPhoneNumber}</span>
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-100 dark:border-amber-900 mb-4">
              <p className="font-medium mb-2 text-amber-800 dark:text-amber-400">Important: Twilio WhatsApp Sandbox Setup</p>
              <ol className="text-sm space-y-2 list-decimal pl-4 text-amber-700 dark:text-amber-400">
                <li>Save the Twilio WhatsApp number <span className="font-mono">+14155238886</span> to your contacts as "DotSpark Bot"</li>
                <li>Send the message <span className="font-mono">join example-sandbox</span> to this number on WhatsApp</li>
                <li>You'll receive a confirmation when connected to the Twilio Sandbox</li>
                <li>You'll receive a code in the format: "<span className="font-mono">123456 is your verification code. For your security, do not share this code.</span>"</li>
                <li>In development mode, the verification code will also appear directly in the UI below</li>
              </ol>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-100 dark:border-red-900 mb-4">
              <p className="font-medium mb-2 text-red-800 dark:text-red-400">Administrator: Configuring Webhook URL</p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">To receive messages from Twilio, configure your webhook URL in the Twilio console:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4 text-red-700 dark:text-red-400">
                <li>In your Twilio console, go to Messaging → Settings → WhatsApp Sandbox Settings</li>
                <li>Set the "When a message comes in" URL to: <span className="font-mono">{window.location.origin}/api/whatsapp/webhook</span></li>
                <li>Make sure the method is set to <span className="font-mono">HTTP POST</span></li>
                <li>This allows Twilio to forward WhatsApp messages to your DotSpark application</li>
              </ol>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
              <p className="font-medium mb-2">Verify your WhatsApp number:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4">
                <li>Check WhatsApp on your phone for a message with a 6-digit code</li>
                <li>Enter the verification code below to activate the DotSpark chatbot</li>
                <li>This security step helps ensure only you can connect your WhatsApp account</li>
                <li>If you don't receive a code within 2 minutes, make sure your WhatsApp is active and connected, then try again</li>
              </ol>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="otpCode">Verification Code</Label>
                <Input 
                  id="otpCode" 
                  placeholder="123456" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerifyOTP} disabled={verifyingOtp} className="mr-2">
                {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Verify
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    await apiRequest("POST", "/api/whatsapp/cancel-verification");
                    setPendingVerification(false);
                    setPendingPhoneNumber("");
                    setOtpCode("");
                  } catch (error) {
                    console.error("Error canceling verification:", error);
                    // Fall back to client-side cancellation if the API fails
                    setPendingVerification(false);
                    setPendingPhoneNumber("");
                    setOtpCode("");
                  }
                }}
              >
                Cancel
              </Button>
            </div>
            
            <div className="flex items-center gap-2 justify-center mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm flex items-center text-muted-foreground"
                onClick={handleRequestOTP}
                disabled={requestingOtp}
              >
                {requestingOtp ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-2" />
                )}
                Resend verification code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-100 dark:border-amber-900 mb-4">
              <p className="font-medium mb-2 text-amber-800 dark:text-amber-400">Important: Twilio WhatsApp Sandbox Setup</p>
              <ol className="text-sm space-y-2 list-decimal pl-4 text-amber-700 dark:text-amber-400">
                <li>Save the Twilio WhatsApp number <span className="font-mono">+14155238886</span> to your contacts as "DotSpark Bot"</li>
                <li>Send the message <span className="font-mono">join example-sandbox</span> to this number on WhatsApp</li>
                <li>You'll receive a confirmation when connected to the Twilio Sandbox</li>
                <li>After connecting to the sandbox, you'll receive messages using the template: "<span className="font-mono">123456 is your verification code. For your security, do not share this code.</span>"</li>
                <li>Once connected, proceed with the steps below to link your DotSpark account</li>
              </ol>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-100 dark:border-red-900 mb-4">
              <p className="font-medium mb-2 text-red-800 dark:text-red-400">Administrator: Configuring Webhook URL</p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">To receive messages from Twilio, configure your webhook URL in the Twilio console:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4 text-red-700 dark:text-red-400">
                <li>In your Twilio console, go to Messaging → Settings → WhatsApp Sandbox Settings</li>
                <li>Set the "When a message comes in" URL to: <span className="font-mono">{window.location.origin}/api/whatsapp/webhook</span></li>
                <li>Make sure the method is set to <span className="font-mono">HTTP POST</span></li>
                <li>This allows Twilio to forward WhatsApp messages to your DotSpark application</li>
              </ol>
            </div>
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
              <p className="font-medium mb-2">Activate DotSpark AI Chatbot on WhatsApp:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4">
                <li>Enter your WhatsApp phone number with country code (e.g., +1 234 567 8900)</li>
                <li>We'll send a verification code to your WhatsApp number</li>
                <li>Verify ownership of your number to activate the DotSpark chatbot</li>
                <li>All knowledge is synced with your DotSpark account automatically</li>
              </ol>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-xs text-muted-foreground">(include country code)</span>
                </Label>
                <Input 
                  id="phoneNumber" 
                  placeholder="+1 234 567 8900" 
                  value={phoneNumber} 
                  onChange={(e) => {
                    // Simple validation to ensure it starts with "+" and only contains digits, spaces, and "+"
                    const value = e.target.value;
                    if (/^[0-9+\s]*$/.test(value)) {
                      setPhoneNumber(value);
                    }
                  }}
                  onBlur={(e) => {
                    // Format on blur: ensure it starts with "+"
                    if (phoneNumber && !phoneNumber.startsWith('+')) {
                      setPhoneNumber(`+${phoneNumber}`);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: +[country code][number] (e.g., +1 for US, +44 for UK)
                </p>
              </div>
              <Button 
                onClick={handleRequestOTP} 
                disabled={requestingOtp || !phoneNumber || phoneNumber.length < 10}
              >
                {requestingOtp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Send Verification
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {registered && (
        <CardFooter className="border-t pt-4 flex justify-end">
          <Button 
            variant="destructive" 
            onClick={handleUnregister} 
            disabled={unregistering}
          >
            {unregistering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
            Deactivate Chatbot
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}