import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Repeat, SmartphoneNfc, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-minimal";

/**
 * Testing controls component for resetting user state and simulating first-time user experience
 * This component helps with testing without requiring new devices
 */
export function TestingControls() {
  const { toast } = useToast();
  const { logout } = useAuth();

  const resetWhatsAppStatus = () => {
    // Clear WhatsApp connection status
    localStorage.removeItem('whatsapp_activated');
    localStorage.removeItem('whatsapp_phone');
    localStorage.removeItem('whatsapp_user_id');
    localStorage.removeItem('whatsapp_visited');
    localStorage.removeItem('neural_just_activated');
    sessionStorage.removeItem('show_activation_success');
    
    toast({
      title: "WhatsApp Status Reset",
      description: "You'll now see the first-time user experience for WhatsApp",
    });
    
    // Force page refresh after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  
  const resetFirstTimeFlags = () => {
    // Clear first-time user flags
    localStorage.removeItem('whatsapp_visited');
    localStorage.removeItem('first_visit');
    localStorage.removeItem('dashboard_visited');
    localStorage.removeItem('activation_viewed');
    
    toast({
      title: "First-Time Flags Reset",
      description: "You'll now see first-time user messages and hints",
    });
    
    // Force page refresh after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  
  const resetAllUserData = async () => {
    // Clear all user data including login state
    localStorage.clear();
    sessionStorage.clear();
    
    toast({
      title: "Complete Reset",
      description: "All user data has been cleared. You'll be logged out.",
    });
    
    // Log out the user
    await logout();
    
    // Force page refresh to ensure everything is reset
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Card className="shadow-lg border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="text-lg">Testing Controls</CardTitle>
        <CardDescription>
          Reset various states to test user flows without needing new devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center"
          onClick={resetWhatsAppStatus}
        >
          <SmartphoneNfc className="h-4 w-4 mr-2" />
          <span>Reset WhatsApp Connection</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center"
          onClick={resetFirstTimeFlags}
        >
          <History className="h-4 w-4 mr-2" />
          <span>Reset First-Time User Flags</span>
        </Button>
        
        <Button 
          variant="destructive" 
          className="w-full flex justify-between items-center"
          onClick={resetAllUserData}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Reset All User Data</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export default TestingControls;