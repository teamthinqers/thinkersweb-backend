import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WhatsAppIntegration() {
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registered, setRegistered] = useState(false);
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
        if (data.registered && data.phoneNumber) {
          setCurrentPhone(data.phoneNumber);
        }
      } catch (error) {
        console.error("Error fetching WhatsApp status:", error);
        toast({
          title: "Error",
          description: "Could not fetch WhatsApp integration status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getWhatsAppStatus();
  }, [toast]);

  // Register a phone number
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
          description: data.message || "WhatsApp integration enabled successfully",
        });
        setRegistered(true);
        setCurrentPhone(phoneNumber);
        setPhoneNumber("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to register WhatsApp number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering WhatsApp:", error);
      toast({
        title: "Error",
        description: "Failed to register WhatsApp number",
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
          description: data.message || "WhatsApp integration disabled successfully",
        });
        setRegistered(false);
        setCurrentPhone("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to disable WhatsApp integration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unregistering WhatsApp:", error);
      toast({
        title: "Error",
        description: "Failed to disable WhatsApp integration",
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
              WhatsApp Integration
            </CardTitle>
            <CardDescription>
              Connect your WhatsApp account to add learning dots directly from messages
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
            
            <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
              <p className="font-medium mb-2">How to use:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4">
                <li>Send any message to create a new learning dot</li>
                <li>Start a message with "Q:" to ask about your learnings</li>
                <li>Type "summary" to get a summary of recent entries</li>
                <li>Type "help" to see all available commands</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
              <p className="font-medium mb-2">Connect your WhatsApp to DotSpark:</p>
              <ol className="text-sm space-y-2 list-decimal pl-4">
                <li>Enter your phone number with country code (e.g., +1 234 567 8900)</li>
                <li>Receive and send messages to create learning dots on the go</li>
                <li>Your data is synced with your DotSpark account automatically</li>
              </ol>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  placeholder="+1 234 567 8900" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button onClick={handleRegister} disabled={registering}>
                {registering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Register
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
            Disable Integration
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}