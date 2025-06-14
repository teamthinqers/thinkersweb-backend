import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Shield, Smartphone, Bell, Database } from "lucide-react";
import { usePWAPermissions } from "@/lib/pwaPermissions";

interface PWAPermissionPromptProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: 'whatsapp' | 'chat' | 'navigation' | 'general';
}

export function PWAPermissionPrompt({ 
  isOpen, 
  onOpenChange, 
  trigger = 'general' 
}: PWAPermissionPromptProps) {
  const { grantPermissions, dontShowAgain } = usePWAPermissions();

  const getTriggerContent = () => {
    switch (trigger) {
      case 'whatsapp':
        return {
          title: "Enable WhatsApp Integration",
          description: "Allow DotSpark to connect with WhatsApp for seamless messaging and notifications.",
          icon: <Smartphone className="h-6 w-6 text-green-600" />
        };
      case 'chat':
        return {
          title: "Enable Chat Features",
          description: "Allow notifications and popups to enhance your chat experience with DotSpark.",
          icon: <Bell className="h-6 w-6 text-blue-600" />
        };
      case 'navigation':
        return {
          title: "Improve Navigation Experience",
          description: "Enable smooth navigation and data persistence for better app performance.",
          icon: <Database className="h-6 w-6 text-purple-600" />
        };
      default:
        return {
          title: "Enhance Your DotSpark Experience",
          description: "Enable notifications and data persistence for the best possible experience.",
          icon: <Shield className="h-6 w-6 text-amber-600" />
        };
    }
  };

  const content = getTriggerContent();

  const handleGrant = async () => {
    const granted = await grantPermissions();
    if (granted) {
      onOpenChange(false);
    }
  };

  const handleNotNow = () => {
    onOpenChange(false);
  };

  const handleDontShowAgain = () => {
    dontShowAgain();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {content.icon}
            <DialogTitle className="text-lg font-semibold">
              {content.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">What this enables:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Push notifications for important updates</li>
              <li>• Seamless navigation without interruptions</li>
              <li>• Offline data storage for better performance</li>
              <li>• Direct links to external services</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGrant}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Allow & Continue
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleNotNow}
                className="flex-1 text-sm"
              >
                Not Now
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDontShowAgain}
                className="flex-1 text-sm text-gray-500"
              >
                Don't Ask Again
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to automatically show permission prompt when needed
export function usePWAPermissionPrompt(trigger?: 'whatsapp' | 'chat' | 'navigation' | 'general') {
  const { showPrompt } = usePWAPermissions();
  const [isOpen, setIsOpen] = React.useState(false);

  // Show prompt when first accessing features that need permissions
  React.useEffect(() => {
    if (showPrompt) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showPrompt]);

  return {
    isOpen,
    setIsOpen,
    PermissionPrompt: (props: Omit<PWAPermissionPromptProps, 'isOpen' | 'onOpenChange'>) => (
      <PWAPermissionPrompt 
        {...props}
        trigger={trigger}
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
      />
    )
  };
}