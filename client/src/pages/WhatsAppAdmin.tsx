import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Phone, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WhatsAppAdmin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registeredNumbers, setRegisteredNumbers] = useState<{number: string, timestamp: string}[]>([]);
  const { toast } = useToast();

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
      
      const response = await apiRequest("POST", "/api/whatsapp/admin-register", {
        phoneNumber
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Add this number to the registered list
        setRegisteredNumbers(prev => [
          { number: phoneNumber, timestamp: new Date().toLocaleTimeString() },
          ...prev
        ]);
        
        // Clear the input
        setPhoneNumber("");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to register number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering WhatsApp number:", error);
      toast({
        title: "Error",
        description: "Something went wrong while registering the number",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">WhatsApp Admin Dashboard</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Register Phone Number
            </CardTitle>
            <CardDescription>
              Manually register a test WhatsApp number to bypass verification
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-xs text-muted-foreground">(include country code)</span>
              </Label>
              <Input 
                id="phoneNumber" 
                placeholder="+1 234 567 8900" 
                value={phoneNumber} 
                onChange={(e) => {
                  // Simple validation to ensure it only contains digits, spaces, and "+"
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
              <p className="text-xs text-muted-foreground">
                Format: +[country code][number] (e.g., +1 for US, +44 for UK)
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>Register Number</>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recently Registered Numbers</CardTitle>
            <CardDescription>
              Numbers that have been registered during this session
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2">
            {registeredNumbers.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="mr-2 h-4 w-4" />
                No numbers registered yet
              </div>
            ) : (
              <ul className="space-y-2">
                {registeredNumbers.map((registration, i) => (
                  <li key={i} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{registration.number}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{registration.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">How to Test WhatsApp Integration:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Register a phone number using the form above</li>
          <li>Have the test user send <code className="bg-background px-1 rounded">join [your-sandbox-code]</code> to your Twilio WhatsApp number</li>
          <li>After joining the sandbox, the user can start chatting normally without verification</li>
          <li>All messages will be associated with the demo user account (ID: 1)</li>
        </ol>
      </div>
    </div>
  );
}