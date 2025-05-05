import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInterface from "./ChatInterface";

interface ChatEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatEntryForm: React.FC<ChatEntryFormProps> = ({ isOpen, onClose }) => {
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
      <DialogContent className="sm:max-w-[600px] h-[80vh] max-h-[700px] p-0 gap-0">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle>Record Your Learning</DialogTitle>
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