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

  // If it's not installable and not installed, don't render anything
  if (!installable && !installed) {
    return null;
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