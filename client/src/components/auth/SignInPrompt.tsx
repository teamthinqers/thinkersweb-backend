import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthBypassButton } from '@/components/dotspark/AuthBypassButton';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle, LogIn } from 'lucide-react';

interface SignInPromptProps {
  onClose?: () => void;
  title?: string;
  description?: string;
}

export function SignInPrompt({ 
  onClose, 
  title = "Authentication Required",
  description = "Please sign in to save your dots and access your personal DotSpark grid."
}: SignInPromptProps) {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      onClose?.();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      // AuthBypassButton will handle the error display
    }
  };

  const handleBypassSuccess = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or try the demo
              </span>
            </div>
          </div>
          
          <AuthBypassButton 
            onAuthSuccess={handleBypassSuccess}
            className="w-full"
          >
            Continue with Demo Account
          </AuthBypassButton>
          
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            Demo account creates working dots but data won't persist permanently. 
            Sign in with Google for full access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}