import { Button } from "@/components/ui/button";
import { promptInstall, isRunningAsStandalone } from "@/lib/pwaUtils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export function PWAInstallButton({
  className = "",
  variant = "default",
  size = "default",
  showIcon = true,
}: PWAInstallButtonProps) {
  const { toast } = useToast();
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    setInstalled(isRunningAsStandalone());

    // Check if the app can be installed
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      (window as any).deferredPrompt = e;
      setInstallable(true);
    };

    // Handle when the app gets installed
    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallable(false);
      toast({
        title: "DotSpark Neura Installed",
        description: "The app has been successfully installed on your device.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Clean up
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = () => {
    if (installable) {
      promptInstall();
    } else if (installed) {
      toast({
        title: "Already Installed",
        description: "DotSpark Neura is already installed on this device.",
      });
    } else {
      toast({
        title: "Installation Not Available",
        description: "Installation is not available at this moment. Try again later or use a supported browser.",
      });
    }
  };

  // If app is installed or not installable, don't render anything
  if (installed || (!installable && !installed)) {
    return null;
  }

  // Detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;
  
  // Custom installation UI for mobile devices that aren't running as standalone
  if (isMobile && !isRunningAsStandalone()) {
    return (
      <div className={`rounded-lg bg-gradient-to-r from-amber-700 to-orange-800 p-4 shadow-lg ${className}`}>
        <div className="flex items-center">
          <div className="mr-3 flex-shrink-0 text-white">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-medium text-white">Install DotSpark Neura</h4>
            <p className="text-xs text-white/80">
              {isIOS 
                ? "Tap the share button and select 'Add to Home Screen'" 
                : "Tap the menu button and select 'Install App'"}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="ml-2 bg-white/20 text-white hover:bg-white/30"
            onClick={() => {
              if (isIOS) {
                toast({
                  title: "iOS Installation Guide",
                  description: "Tap the Share button at the bottom of your screen, then select 'Add to Home Screen'",
                });
              } else if (isAndroid) {
                toast({
                  title: "Android Installation Guide",
                  description: "Tap the three dots menu, then select 'Install App' or 'Add to Home Screen'",
                });
              } else {
                toast({
                  title: "Installation Guide",
                  description: "Use your browser's menu to install this app to your home screen",
                });
              }
            }}
          >
            How?
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleInstallClick}
      disabled={!installable && !installed}
    >
      {showIcon && <Download className="mr-2 h-4 w-4" />}
      {installed ? "Installed" : "Install App"}
    </Button>
  );
}