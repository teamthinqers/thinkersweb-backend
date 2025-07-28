import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Brain, Sparkles } from 'lucide-react';

interface DotSparkActivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DotSparkActivationDialog: React.FC<DotSparkActivationDialogProps> = ({ 
  isOpen, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800">
            <Lock className="w-5 h-5" />
            DotSpark Activation Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Activate DotSpark to Create Content
            </h3>
            <p className="text-gray-600 text-sm">
              You need to activate DotSpark to create and save your personal dots, wheels, and chakras.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              DotSpark Features Include:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Create unlimited dots, wheels, and chakras</li>
              <li>• AI-powered content analysis and insights</li>
              <li>• Vector database storage for intelligent retrieval</li>
              <li>• Personal thought organization and patterns</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={() => {
                // Navigate to activation page or process
                window.location.href = '/my-neura';
                onClose();
              }}
            >
              <Brain className="w-4 h-4 mr-2" />
              Activate DotSpark Now
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Maybe Later
            </Button>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Free to activate - enhance your cognitive abilities
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DotSparkActivationDialog;