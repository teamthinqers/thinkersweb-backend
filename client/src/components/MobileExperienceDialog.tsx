import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

interface MobileExperienceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDesktopMode: () => void;
  onInstallApp: () => void;
}

export function MobileExperienceDialog({ 
  isOpen, 
  onClose, 
  onDesktopMode, 
  onInstallApp 
}: MobileExperienceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Choose Your Experience
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <p className="text-center text-gray-600 text-sm">
            For the best DotSpark experience, please choose one of the following options:
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={onDesktopMode}
              className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <Monitor className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Desktop Mode</div>
                  <div className="text-xs opacity-90">Switch to desktop view</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={onInstallApp}
              className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Install Web App</div>
                  <div className="text-xs opacity-90">Get the mobile app experience</div>
                </div>
              </div>
            </Button>
          </div>
          
          <div className="pt-2">
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Continue with mobile browser
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}