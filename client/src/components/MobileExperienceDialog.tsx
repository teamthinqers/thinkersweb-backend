import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, X } from 'lucide-react';

interface MobileExperienceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileExperienceDialog({ 
  isOpen, 
  onClose
}: MobileExperienceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Better Experience Available
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-4">
            <p className="text-gray-700 text-base font-medium">
              For the best DotSpark experience, please choose:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Monitor className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Desktop Mode</div>
                  <div className="text-sm text-blue-700">Access DotSpark on your computer browser for full features</div>
                </div>
              </div>
              
              <div className="text-center text-gray-500 font-medium">OR</div>
              
              <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <Smartphone className="h-8 w-8 text-amber-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-amber-900">Install Web App</div>
                  <div className="text-sm text-amber-700">Add DotSpark to your home screen for mobile app experience</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full text-gray-600 hover:text-gray-800 border-gray-300"
            >
              <X className="h-4 w-4 mr-2" />
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}