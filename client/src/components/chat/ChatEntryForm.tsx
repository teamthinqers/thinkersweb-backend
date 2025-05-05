import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInterface from "./ChatInterface";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface ChatEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatEntryForm: React.FC<ChatEntryFormProps> = ({ isOpen, onClose }) => {
  const isMobile = useMobile();
  
  // Handle escape key to close the dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[95vw] max-w-full h-[90vh] rounded-lg' : 'sm:max-w-[600px] h-[80vh] max-h-[700px]'} 
          p-0 gap-0
        `}
      >
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Record Your Learning</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-0 h-full">
          <div className="h-full">
            <ChatInterface />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChatEntryForm;