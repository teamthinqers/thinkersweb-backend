import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";

interface ContactOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
}

export function ContactOptionsDialog({ open, onOpenChange, phoneNumber }: ContactOptionsDialogProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("DOTSPARKSOCIAL");
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start Your DotSpark Journey
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Send "DOTSPARKSOCIAL" to activate your neural connection and begin your cognitive enhancement journey.
          </div>
          
          <Button 
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Open WhatsApp
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            This will open WhatsApp with the activation message ready to send
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}